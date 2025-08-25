"""add chat session and username to score

Revision ID: e3b1c53f8a3a
Revises: 8bc83ae4e44e
Create Date: 2024-06-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'e3b1c53f8a3a'
down_revision = '8bc83ae4e44e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('score', sa.Column('username', sa.String(length=80), nullable=False))
    op.create_table(
        'chat_session',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('messages', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_activity', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_id')
    )


def downgrade():
    op.drop_table('chat_session')
    op.drop_column('score', 'username')
