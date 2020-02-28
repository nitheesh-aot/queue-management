"""empty message

Revision ID: 5b3921d80d78
Revises: 06e914da9675
Create Date: 2019-12-16 17:59:50.519913

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy_utc


# revision identifiers, used by Alembic.
revision = '5b3921d80d78'
down_revision = '06e914da9675'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('exam', sa.Column('examinee_email', sa.String(length=400), nullable=True))
    op.add_column('exam', sa.Column('examinee_phone', sa.String(length=400), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('exam', 'examinee_phone')
    op.drop_column('exam', 'examinee_email')
    # ### end Alembic commands ###