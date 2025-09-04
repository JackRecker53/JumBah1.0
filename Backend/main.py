import uvicorn
from multiprocessing import Process
from app import app

def run_main_app():
    """Run the main FastAPI application"""
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Enable auto-reload for development
    )

def start_all_services():
    """Start all backend services"""
    processes = []
    
    # Add the main FastAPI app
    main_process = Process(target=run_main_app)
    processes.append(main_process)
    
    # Start all processes
    for process in processes:
        process.start()
    
    # Wait for all processes to complete
    for process in processes:
        process.join()

if __name__ == "__main__":
    print("Starting all backend services...")
    try:
        start_all_services()
    except KeyboardInterrupt:
        print("\nShutting down all services...")
    except Exception as e:
        print(f"Error occurred: {str(e)}")
    finally:
        print("All services have been stopped.")
