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

from flask import request, g
from flask_restx import Resource
from qsystem import api, api_call_with_retry, db, oidc, socketio, my_print
from app.models.theq import Citizen, CSR, Counter
from marshmallow import ValidationError
from app.schemas.theq import CitizenSchema
from sqlalchemy import exc
from app.utilities.snowplow import SnowPlow

@api.route("/citizens/<int:id>/", methods=["GET", "PUT"])
class CitizenDetail(Resource):

    citizen_schema = CitizenSchema()

    @oidc.accept_token(require_token=True)
    def get(self, id):
        try:
            citizen = Citizen.query.filter_by(citizen_id=id).first()
            citizen_ticket = "None"
            if hasattr(citizen, 'ticket_number'):
                citizen_ticket = str(citizen.ticket_number)
            my_print("==> GET /citizens/" + str(citizen.citizen_id) + '/, Ticket: ' + citizen_ticket)
            result = self.citizen_schema.dump(citizen)
            return {'citizen': result.data,
                    'errors': result.errors}

        except exc.SQLAlchemyError as e:
            print(e)
            return {'message': 'API is down'}, 500

    @oidc.accept_token(require_token=True)
    @api_call_with_retry
    def put(self, id):
        json_data = request.get_json()

        if 'counter_id' not in json_data:
            json_data['counter_id'] = counter_id

        if not json_data:
            return {'message': 'No input data received for updating citizen'}, 400

        csr = CSR.find_by_username(g.oidc_token_info['username'])
        citizen = Citizen.query.filter_by(citizen_id=id).first()
        my_print("==> PUT /citizens/" + str(citizen.citizen_id) + '/, Ticket: ' + str(citizen.ticket_number))

        try:
            citizen = self.citizen_schema.load(json_data, instance=citizen, partial=True).data

        except ValidationError as err:
            return {'message': err.messages}, 422

        db.session.add(citizen)
        db.session.commit()

        #  If this put request is the result of an appointment checkin, make a Snowplow call.
        if ('snowplow_addcitizen' in json_data) and (json_data['snowplow_addcitizen'] == True):
            SnowPlow.add_citizen(citizen, csr)

        result = self.citizen_schema.dump(citizen)
        socketio.emit('update_active_citizen', result.data, room=csr.office_id)

        return {'citizen': result.data,
                'errors': result.errors}, 200

try:
    counter = Counter.query.filter(Counter.counter_name=="Counter")[0]
    counter_id = counter.counter_id
#  NOTE!!  There should ONLY be an exception when first building the database
#          from a python3 manage.py db upgrade command.
except:
    counter_id = 1
    print("==> In citizen_detail.py")
    print("    --> NOTE!!  You should only see this if doing a 'python3 manage.py db upgrade'")
