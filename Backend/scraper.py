from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://www.infosabah.com.my/en"
DESTINATION_LIST = f"{BASE_URL}/destinations/"
DEFAULT_OUTPUT = Path(__file__).parent / "data" / "attractions.json"


def fetch_soup(url: str) -> BeautifulSoup:
    """Return a :class:`BeautifulSoup` parsed tree for *url*.

    Raises:
        requests.HTTPError: if the request fails.
    """

    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def parse_attraction(url: str) -> Dict[str, Optional[str]]:
    """Parse a single attraction page.

    The function attempts to extract the attraction's name, description,
    a representative image URL and the district it belongs to.  The exact
    HTML structure of the destination pages may change over time so the
    selectors are intentionally defensive.
    """

    soup = fetch_soup(url)

    # Name / title
    name_tag = soup.find("h1")
    name = name_tag.get_text(strip=True) if name_tag else ""

    # Description – first paragraph of the main content
    desc_tag = (
        soup.find("div", class_=re.compile("entry-content|article"))
        or soup.find("article")
    )
    description = desc_tag.get_text(" ", strip=True) if desc_tag else ""

    # Image – pick the first image in the content
    img_tag = soup.find("img")
    image = img_tag.get("src") if img_tag else ""

    # District – look for a label followed by text
    district = None
    district_label = soup.find(string=re.compile("district", re.I))
    if district_label:
        next_el = district_label.find_next()
        district = next_el.get_text(strip=True) if next_el else None

    return {
        "name": name,
        "desc": description,
        "image": image,
        "district": district,
    }


def scrape_sabah_tourism(
    limit: Optional[int] = None,
) -> List[Dict[str, Optional[str]]]:
    """Scrape attraction data from the official Sabah Tourism page."""

    soup = fetch_soup(DESTINATION_LIST)
    links = [a.get("href") for a in soup.select("a") if a.get("href")]

    attractions: List[Dict[str, Optional[str]]] = []

    for href in links:
        if not href.startswith("http"):
            href = BASE_URL + href

        # Only follow links that look like attraction pages
        if "/destination/" not in href:
            continue

        try:
            data = parse_attraction(href)
        except requests.HTTPError:
            # Ignore pages that fail to load
            continue

        attractions.append(data)

        if limit and len(attractions) >= limit:
            break

    return attractions


def group_by_district(
    attractions: Iterable[Dict[str, Optional[str]]]
) -> Dict[str, Dict[str, List[Dict[str, str]]]]:
    """Group attractions by district in the application's JSON format."""

    result: Dict[str, Dict[str, List[Dict[str, str]]]] = {}
    for attr in attractions:
        district = attr.get("district") or "Unknown"
        entry = result.setdefault(
            district, {"description": "", "attractions": []}
        )
        entry["attractions"].append(
            {
                "name": attr.get("name", ""),
                "desc": attr.get("desc", ""),
                "image": attr.get("image", ""),
            }
        )
    return result


def save_json(
    data: Dict[str, Dict[str, List[Dict[str, str]]]], path: Path
) -> None:
    """Write *data* to *path* as JSON."""

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def run(output: Path, limit: Optional[int] = None) -> None:
    """High level helper that performs the full scraping workflow."""

    attractions = scrape_sabah_tourism(limit=limit)
    grouped = group_by_district(attractions)
    save_json(grouped, output)


def main(argv: Optional[List[str]] = None) -> None:
    """Command line interface for the scraper."""

    parser = argparse.ArgumentParser(description="Scrape Sabah tourism data")
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Path to write attractions JSON (default: %(default)s)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of attractions to scrape",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=None,
        help="Repeat scraping every N hours (omit to run once)",
    )

    args = parser.parse_args(argv)

    while True:
        run(args.output, args.limit)
        if args.interval is None:
            break
        time.sleep(args.interval * 3600)


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    main()
