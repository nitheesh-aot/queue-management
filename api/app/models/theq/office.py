'''Copyright 2018 Province of British Columbia

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.'''

from qsystem import db
from app.models.theq import Base
from app.models.bookings import Exam, Room


class Office(Base):

    office_service = db.Table(
        'office_service',
        db.Column('office_id', db.Integer,
                db.ForeignKey('office.office_id', ondelete="CASCADE"), primary_key=True),
        db.Column('service_id', db.Integer,
                db.ForeignKey('service.service_id', ondelete="CASCADE"), primary_key=True))

    office_quick_list = db.Table(
        'office_quick_list',
        db.Column('office_id', db.Integer,
                db.ForeignKey('office.office_id', ondelete="CASCADE"), primary_key=True),
        db.Column('service_id', db.Integer,
                db.ForeignKey('service.service_id', ondelete="CASCADE"), primary_key=True))

    office_back_office_list = db.Table(
        'office_back_office_list',
        db.Column('office_id', db.Integer,
                db.ForeignKey('office.office_id', ondelete="CASCADE"), primary_key=True),
        db.Column('service_id', db.Integer,
                db.ForeignKey('service.service_id', ondelete="CASCADE"), primary_key=True))

    office_counter= db.Table(
        'office_counter',
        db.Column('office_id', db.Integer,
                db.ForeignKey('office.office_id', ondelete="CASCADE"), primary_key=True),
        db.Column('counter_id', db.Integer,
                db.ForeignKey('counter.counter_id', ondelete="CASCADE"), primary_key=True))

    office_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    office_name = db.Column(db.String(100))
    office_number = db.Column(db.Integer)
    sb_id = db.Column(db.Integer, db.ForeignKey('smartboard.sb_id'))
    deleted = db.Column(db.DateTime, nullable=True)
    exams_enabled_ind = db.Column(db.Integer, nullable=False)
    appointments_enabled_ind = db.Column(db.Integer, nullable=False, default=0)
    timezone_id = db.Column(db.Integer, db.ForeignKey('timezone.timezone_id'), nullable=True)

    counters = db.relationship("Counter", secondary='office_counter')
    services = db.relationship("Service", secondary='office_service')
    quick_list = db.relationship("Service", secondary='office_quick_list')
    back_office_list = db.relationship("Service", secondary='office_back_office_list')
    csrs = db.relationship('CSR')
    citizens = db.relationship('Citizen', backref='office_citizens')

    sb = db.relationship('SmartBoard')
    timezone = db.relationship('Timezone')

    exams = db.relationship("Exam")
    rooms = db.relationship('Room')

    def __repr__(self):
        return self.office_name

    def __init__(self, **kwargs):
        super(Office, self).__init__(**kwargs)
