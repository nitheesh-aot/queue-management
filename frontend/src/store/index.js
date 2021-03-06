/*Copyright 2015 Province of British Columbia

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.*/

import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import tZone from 'moment-timezone'
import 'es6-promise/auto'
import { addExamModule } from './add-exam-module'
import appointmentsModule from './appointments-module'
import { Axios, searchNestedObject } from './helpers'

var flashInt

Vue.use(Vuex)

const DEFAULT_COUNTER_NAME = "Counter";
var _default_counter_id = null;

export const store = new Vuex.Store({
  modules: {
    addExamModule, appointmentsModule,
  },
  state: {
    addExamModal: {
      visible: false,
      setup: null,
      step1MenuOpen: false,
      office_number: null,
    },
    addModalForm: {
      citizen:'',
      comments: '',
      channel: '',
      search: '',
      category: '',
      service:'',
      suspendFilter: false,
      selectedItem: '',
      priority: 2,
      counter: null,
    },
    addModalSetup: null,
    addNextService: false,
    adminNavigation: '',
    appointmentsStateInfo: {
      channel_id: null,
      service_id: null,
    },
    alertMessage: '',
    allCitizens: [],
    backOfficeDisplay: 'BackOffice',
    recurringFeatureFlag: '',
    bearer: '',
    bookings: [],
    calendarEvents: [],
    calendarSetup: null,
    capturedExam: {},
    captureITAExamTabSetup: {
      step: 1,
      highestStep: 1,
      stepsValidated: [],
      errors: [],
      showRadio: true,
      status: 'unknown',
      notes: false,
    },
    categories: [],
    channels: [],
    citizenButtons: false,
    citizenInvited: false,
    citizens: [],
    clickedDate: '',
    csr_states: [],
    csrs: [],
    dismissCount: 0,
    diskspace: {},
    displayServices: 'All',
    editDeleteSeries: false,
    editedBooking: null,
    editedBookingOriginal: null,
    editedGroupBooking: null,
    editExamFailureCount: 0,
    editExamSuccessCount: 0,
    examAlertMessage: '',
    examDismissCount: 0,
    examEditFailureMessage: '',
    examEditSuccessMessage: '',
    exams: [],
    event_ids: null,
    event_id_warning: false,
    examsTrackingIP: false,
    examSuccessDismiss : 0,
    examTypes: [],
    feedbackMessage: '',
    iframeLogedIn: false,
    inventoryFilters: {
      expiryFilter: 'current',
      scheduledFilter: 'both',
      groupFilter: 'both',
      returnedFilter: 'unreturned',
      office_number: 'default',
      requireAttentionFilter: 'default',
      requireOEMAttentionFilter: 'default',
    },
    invigilators: [],
    shadowInvigilators: [],
    isLoggedIn: false,
    isUploadingFile: false,
    manifestdata: '',
    loginAlertMessage: '',
    loginDismissCount: 0,
    nonITAExam: false,
    nowServing: false,
    officeFilter: null,
    offices: [],
    officeType: null,
    offsiteOnly: false,
    offsiteVisible: true,
    performingAction: false,
    rescheduling: false,
    returnExam: null,
    roomResources: [],
    rooms: [],
    scheduling: false,
    selectedExam: {},
    selectedExamType: '',
    selectedExamTypeFilter: '',
    selectedQuickAction: '',
    selectedQuickActionFilter: '',
    selectedOffice: {},
    selectionIndicator: false,
    serveModalAlert: '',
    serveNowAltAction: false,
    serveNowStyle: 'btn-primary',
    serviceBegun: false,
    serviceModalForm: {
      citizen_id: null,
      service_citizen: null,
      citizen_comments: '',
      activeQuantity: 1,
      accurate_time_ind: 1,
      priority: 2,
      counter: 1,
    },
    services: [],
    showAddModal: false,
    showAdmin: false,
    showAppointmentBlackoutModal: false,
    showBookingModal: false,
    showBookingBlackoutModal: false,
    showDeleteExamModal: false,
    showEditBookingModal: false,
    showEditExamModal: false,
    showEditGroupBookingModal: false,
    showExamInventoryModal: false,
    showFeedbackModal: false,
    showGAScreenModal: false,
    showGenFinReportModal: false,
    showOtherBookingModal: false,
    showResponseModal: false,
    showReturnExamModal: false,
    showSelectInvigilatorModal: false,
    showServeCitizenSpinner: false,
    showInviteCitizenSpinner: false,
    showServiceModal: false,
    showTimeTrackingIcon: false,
    user: {
      counter_id: null,
      csr_id: null,
      csr_state_id: null,
      csr_state: {
        csr_state_desc: null,
        csr_state_id: null,
        csr_state_name: null
      },
      username: null,
      office: {
        office_id: null,
        office_name: null,
        sb: {
          sb_type: null,
        },
        counters: [],
        quick_list: [],
        back_office_list: []
      },
      office_id: null,
      receptionist_ind: null
    },
    userLoadingFail: false,
    videofiles: []
  },

  getters: {
    add_modal_steps(state) {
      if (state.addExamModal && state.addExamModal.setup)  {
        switch(state.addExamModal.setup) {
          case 'challenger':
            return state.addExamModule.addChallengerSteps
          case 'group':
            return state.addExamModule.addGroupSteps
          case 'individual':
            return state.addExamModule.addIndividualSteps
          case 'pesticide':
            return state.addExamModule.addPesticideSteps
          case 'other':
            return state.addExamModule.addOtherSteps
          default:
            return []
        }
      }
    },

    admin_navigation_nonblank(state) {
      if (state.adminNavigation != '') { return state.adminNavigation }
      else {
        //  Default navigation is to the GA Edit CSR screen.
        let nav = 'csrga'

        //  Calculate if it needs to be changed.
        if (state.user && state.user.role && state.user.role.role_code == 'SUPPORT') {
          nav = 'csr'
        }
        if (state.user && state.user.role && state.user.role.role_code == 'ANALYTICS') {
          nav = 'service'
        }

        //  Return the right option
        return nav
      }
    },

    commentsTooLong(state) {
      return state.addModalForm.comments.length > 1000;
    },

    invigilator_dropdown(state) {
      let invigilators = [
        {value: null, text: 'unassigned', shadow_count: 2},
        {value: 'sbc', text: 'SBC Staff', shadow_count: 2}
      ]
      state.invigilators.forEach( i => {
        invigilators.push({ value: i.invigilator_id, text: i.invigilator_name, shadow_count: i.shadow_count })
      })
      return invigilators.filter(i => i.shadow_count == 2)
    },

    shadow_invigilator_options(state){
      let invigilators = []
      state.invigilators.forEach(i => {
        invigilators.push({ id: i.invigilator_id, name: i.invigilator_name, shadow_count: i.shadow_count })
      })
      return invigilators.filter( i => i.shadow_count < 2)
    },

    shadow_invigilators(state){
      let invigilators = []
      state.invigilators.forEach(i => {
        invigilators.push({ id: i.invigilator_id, name: i.invigilator_name, shadow_count: i.shadow_count })
      })
      return invigilators
    },

    all_invigilator_options(state){
      let invigilators = []
      state.invigilators.forEach(i => {
        invigilators.push({ id: i.invigilator_id, name: i.invigilator_name})
      })
      return invigilators
    },

    invigilator_multi_select(state) {
      let invigilators = []
      state.invigilators.forEach( i => {
        invigilators.push({ value: i.invigilator_id, name: i.invigilator_name, shadow_count: i.shadow_count })
      })
      return invigilators.filter(i => i.shadow_count == 2)
    },

    show_scheduling_indicator: (state) => {
      if (state.scheduling || state.rescheduling) {
        if (!state.showOtherBookingModal && !state.showBookingModal && !state.showEditBookingModal) {
          return true
        }
      }
      return false
    },

    filtered_calendar_events: (state, getters) => (search) => {
      return state.calendarEvents.filter(event => searchNestedObject(event, search))
    },

    exam_inventory(state) {
      if (state.showExamInventoryModal) {
        return state.exams.filter(exam => exam.booking_id === null)
      }
      return state.exams
    },

    exam_object_id: (state, getters) => (examId) => {
      return state.examTypes.find(type => type.exam_type_id == examId)
    },

    exam_object(state) {
      if (state.capturedExam && state.capturedExam.exam_type_id) {
        return state.examTypes.find(type => type.exam_type_id == state.capturedExam.exam_type_id)
      }
      return {
        exam_color: '',
        exam_type_name: '',
        exam_type_id: ''
      }
    },

    showExams(state) {
      if (state.user && state.user.office.exams_enabled_ind === 1) {
        return true
      }
      return false
    },

    showAppointments(state) {
      if (state.user && state.user.office.appointments_enabled_ind === 1){
        return true
      }
      return false
    },

    add_exam_modal_navigation_buttons(state) {
      //controls disabled/enabled state of and current classes applied to the 'next' button in AddExamFormModal
      let setup = state.captureITAExamTabSetup
      if (setup.stepsValidated.indexOf(setup.step) === -1) {
        return {
          nextClass: 'btn-secondary disabled',
          nextDisabled: true
        }
      }
      return {
        nextClass: 'btn-primary',
        nextDisabled: false
      }
    },

    role_code(state) {
      if (state.user && state.user.role && state.user.role.role_code) {
        return state.user.role.role_code
      }
      return ''
    },

    is_pesticide_designate(state) {
      if (state.user.pesticide_designate) {
        return true
      }
      return false
    },

    is_financial_designate(state) {
      if(state.user.finance_designate){
        return true
      }
      return false
    },

    is_liaison_designate(state) {
      if(state.user.liaison_designate){
        return true
      }
      return false
    },

    is_ita_designate(state) {
      if(state.user.ita_designate){
        return true
      }
      return false
    },

    is_recurring_enabled(state){
      if(state.recurringFeatureFlag === 'On'){
        return true
      }
      return false
    },

    reception(state) {
      if (state.user.office && state.user.office.sb) {
        if (state.user.office.sb.sb_type === "callbyname" || state.user.office.sb.sb_type === "callbyticket") {
          return true
        }
        return false
      }
    },

    active_index(state, getters) {
      let { service_citizen } = state.serviceModalForm

      if (!service_citizen || !service_citizen.service_reqs || service_citizen.service_reqs.length === 0) {
        return 0
      }
      return service_citizen.service_reqs.findIndex(sr => sr.periods.some(p => p.time_end == null))
    },

    active_service: (state, getters) => {
      let { service_citizen } = state.serviceModalForm
      if (!service_citizen || !service_citizen.service_reqs || service_citizen.service_reqs.length === 0) {
        return null
      }
      return service_citizen.service_reqs.filter(sr => sr.periods.some(p => p.time_end == null))[0]
    },

    active_service_id: (state) => (citizen_id) => {
      let { citizens } = state
      let citizen = citizens.find(c => c.citizen_id === citizen_id)

      return citizen.service_reqs.find(sr=>sr.periods.some(p=>p.time_end === null))
    },

    invited_service_reqs: (state, getters) => {
      let { service_citizen } = state.serviceModalForm

      if (!service_citizen || !service_citizen.service_reqs || service_citizen.service_reqs.length === 0) {
        return []
      }

      return service_citizen.service_reqs.sort((a,b) => { return b.sr_id - a.sr_id })
    },

    invited_citizen: (state) => {
      let { service_citizen } = state.serviceModalForm
      return service_citizen
    },

    on_hold_queue(state) {
      let { citizens } = state
      if (!citizens || citizens.length===0) {
        return []
      }

      let isCitizenOnHold = function(c) {
        let test = c.service_reqs.filter(sr=>sr.periods.some(p=>p.time_end == null && p.ps.ps_name === 'On hold'))
        if (test.length > 0) {
          return true
        }
        return false
      }
      let filtered = citizens.filter(c=>c.service_reqs.length > 0)
      let list = filtered.filter(isCitizenOnHold)
      return list
    },

    citizens_queue(state) {
      let { citizens } = state
      if (!citizens || citizens.length===0) {
        return []
      }

      let isCitizenQueued = function(c) {
        let test = c.service_reqs.filter(sr=>sr.periods.some(p=>p.time_end == null && p.ps.ps_name === 'Waiting'))
        if (test.length > 0) {
          return true
        }
        return false
      }
      let filtered = citizens.filter(c=>c.service_reqs.length > 0)
      let list = filtered.filter(isCitizenQueued)
      return list
    },

    form_data: state => {
      return state.addModalForm
    },

    channel_options: state => {
      return state.channels.map(ch=>({value: ch.channel_id, text: ch.channel_name}))
    },

    categories_options: (state, getters) => {
      let services = state.services
      if (state.displayServices === "Dashboard") {
        services = getters.services_dashboard
      }
      if (state.displayServices === "BackOffice") {
        services = getters.services_backoffice
      }
      let opts = state.categories.filter(o => services.some(s => s.parent_id === o.service_id))

      let mappedOpts = opts.map(opt =>
        ({value: opt.service_id, text: opt.service_name})
      )
      let blankOpt = [{value:'', text:'Categories'}]
      return blankOpt.concat(mappedOpts)
    },

    services_dashboard: (state) => {
      let services = state.services
      services = services.filter(service=>service.display_dashboard_ind === 1)
      return services
    },

    services_backoffice: (state) => {
      let services = state.services
      services = services.filter(service=>service.display_dashboard_ind === 0)
      return services
    },

    filtered_services: (state, getters) => {
      let services = state.services
      if (state.displayServices === "Dashboard") {
        services = services.filter(service=>service.display_dashboard_ind === 1)
      }
      if (state.displayServices === "BackOffice") {
        services = services.filter(service=>service.display_dashboard_ind === 0)
      }

      if (getters.form_data.category) {
        return services.filter(service=>service.parent_id === getters.form_data.category)
      } else {
        return services
      }
    },

    receptionist_status(state) {
      if (state.user.receptionist_ind == 1) {
        return true
      } else if (state.user.receptionist_ind == 0) {
        return false
      } else {
        console.error('receptionist status: ', state.user.receptionist_ind)
      }
    }
  },

  actions: {

    loginIframe(context) {
      Axios(context).get('/login/').then( () => {
        context.commit('setiframeLogedIn', true)
      })
    },

    clickUploadFile(context, payload) {
      context.commit('setIsUploadingFile', true)
      let formData = new FormData();
      if (payload.file) {
        formData.append("file", payload.file);
        if (payload.newname) {
          formData.append("newname", payload.newname);
        }
      }
      formData.append("manifest", payload.data);
      var contenttype = {
        headers: {
          "content-type" : "multipart/form-data"
        }
      };

      // Post the data to the back end.
      Axios(context).post('/upload/', formData, contenttype)
        .then(
          resp => {
            context.commit('setMainAlert', 'File uploaded successfully.')
            context.dispatch('requestVideoFileInfo')
          },
          error => {
            context.commit('setMainAlert', 'An error occurred uploading your file.')
          })
        .catch(() => {
          context.commit('setMainAlert', 'An exceptoin occurred uploading your file.')
        })
        .finally(() => {
            context.commit('setIsUploadingFile', false)
          })
    },

    clickDeleteFile(context, payload) {

      // Post the file name to delete to the back end.
      Axios(context).delete('/videofiles/', { 'data' : payload })
        .then(
          resp => {
            context.commit('setMainAlert', 'File deleted successfully.')
            context.dispatch('requestVideoFileInfo')
          },
          error => {
            context.commit('setMainAlert', 'File could not be deleted.')
          })
        // .catch(() => {
        //   context.commit('setMainAlert', 'An exception occurred trying to delete file.')
        // })
    },

    requestVideoFileInfo(context) {
      // Get video file info from the back end.
      Axios(context).get('/videofiles/')
        .then (resp => {
          let videofiles = resp.data.videofiles;
          let manifestdata = resp.data.manifest;
          let diskspace = resp.data.space;
          context.commit('setVideoFiles', videofiles);
          context.commit('setManifestData', manifestdata);
          context.commit('setDiskSpace', diskspace);
        })
        .catch(error => {
          console.log('error in requestVideoFileInfo')
          console.log(error.response)
          console.log(error.message)
        })
    },

    changeAdminView(context, view) {
      if (view !== null) {
        context.commit("setNavigation", view)
      }
    },

    deleteBooking(context, id) {
      return new Promise((resolve, reject) => {
        Axios(context).delete(`/bookings/${id}/`).then(resp => {
          resolve(resp.data)
        })
          .catch(error => {
            reject(error)
          })
      })
    },

    deleteRecurringBooking(context, id) {
      return new Promise((resolve, reject) => {
        Axios(context).delete(`/bookings/recurring/${id}`).then(resp => {
          resolve(resp.data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    deleteExam(context, id) {
      return new Promise((resolve, reject) => {
        Axios(context).delete(`/exams/${id}/`).then(resp => {
          resolve(resp.data)
        })
          .catch(error => {
            reject(error)
          })
      })
    },

    putRequest(context, payload) {
      return new Promise((resolve, reject) => {
        Axios(context).put(payload.url, payload.data).then( () => {
          resolve()
        }).catch( () => {
          reject()
        })
      })
    },

    putBooking(context, payload) {
      return new Promise((resolve, reject) => {
        Axios(context).put(`/bookings/${payload.id}/`, payload.changes).then(resp => {
          resolve(resp.data)
        })
        .catch(error => {
          reject(error)
        })
      })
    },

    putRecurringBooking(context, payload) {
      return new Promise((resolve, reject) => {
        Axios(context).put(`/bookings/recurring/${payload.recurring_uuid}`, payload.changes).then(resp => {
          resolve(resp.data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    putInvigilatorShadow(context, payload){
      return new Promise((resolve, reject) => {
        Axios(context).put(`/invigilator/${payload.id}/${payload.params}`).then(resp => {
          resolve(resp.data)
        })
          .catch(error => {
            reject(error)
          })
      })
    },

    flashServeNow(context, payload) {
      let flash = () => {
        if (!context.state.showServiceModal) {
          if ( context.state.serveNowStyle === 'btn-primary' ) {
            context.commit('flashServeNow', 'btn-highlighted')
          } else if ( context.state.serveNowStyle === 'btn-highlighted' ) {
            context.commit('flashServeNow', 'btn-primary')
          }
        }
      }
      if (payload === 'start') {
        clearInterval(flashInt)
        flashInt = setInterval( ()=>{ flash() }, 800)
        return
      }
      if (payload === 'stop') {
        clearInterval(flashInt)
        context.commit('flashServeNow', 'btn-primary')
      }
    },

    logIn(context, payload) {
      context.commit('setBearer', payload)
      context.commit('logIn')
      context.dispatch('getUser').catch(() => {
        context.commit('setUserLoadingFail', true)
      })
    },

    getBookings(context) {
      return new Promise((resolve, reject) => {
        Axios(context).get('/bookings/')
        .then(resp => {
          context.commit('setBookings', resp.data.bookings)
          let calendarEvents = []
          resp.data.bookings.forEach(b => {
            let booking = {}
            if (b.room_id) {
              booking.resourceId = b.room_id
              booking.room = b.room
            }
            if (!b.room_id) {
              booking.resourceId = '_offsite'
            }
            if (b.invigilator_id) {
              booking.invigilator = b.invigilator
              booking.invigilator_id = b.invigilator_id
            }
            booking.start = b.start_time
            booking.end = b.end_time
            booking.title = b.booking_name
            booking.id = b.booking_id
            booking.exam = context.state.exams.find(ex => ex.booking_id == b.booking_id) || false
            booking.booking_contact_information = b.booking_contact_information
            booking.fees = b.fees
            booking.shadow_invigilator_id = b.shadow_invigilator_id
            booking.blackout_flag = b.blackout_flag
            booking.blackout_notes = b.blackout_notes
            booking.recurring_uuid = b.recurring_uuid
            calendarEvents.push(booking)
          })
          context.commit('setEvents', calendarEvents)
          resolve()
        }).catch(() => { reject() })
      })
    },

    getAllCitizens(context) {
      let url = '/citizens/'
      return new Promise((resolve, reject) => {
        Axios(context).get(url).then( resp => {
          if (!resp.data.citizens) {
            context.commit('updateQueue', [])
            resolve()
            return
          }
          context.commit('updateQueue', resp.data.citizens)
          resolve()
        })
      })
    },

    getCategories(context) {
      Axios(context).get('/categories/')
        .then( resp => {
          context.commit('setCategories', resp.data.categories)
        })
        .catch(error => {
          console.log('error @ store.actions.getCategories')
          console.log(error.response)
          console.log(error.message)
        })
    },

    getChannels(context) {
      return new Promise((resolve, reject) => {
        let url = `/channels/`
        Axios(context).get(url).then(resp=>{
          context.commit('setChannels', resp.data.channels)
          resolve(resp)
        }, error => {
          reject(error)
        })
      })
    },

    getCitizen(context, citizen_id) {
      return new Promise((resolve, reject) => {
        let url = `/citizens/${citizen_id}/`
        Axios(context).get(url).then(resp=>{
          resolve(resp)
        }, error => {
          reject(error)
        })
      })
    },

    getCsrStateIDs(context) {
      Axios(context).get("/csr_states/")
        .then(resp => {
          var states = resp.data.csr_states;
          states.forEach(x => {
            context.state.csr_states[x.csr_state_name] = x.csr_state_id;
          });
        })
        .catch(error => {
          console.log("error @ store.actions.getCsrStateIDs");
          console.log(error.response);
          console.log(error.message);
        });
    },

    getCsrs(context) {
      Axios(context).get('/csrs/')
        .then(resp => {
          context.commit('setCsrs', resp.data.csrs)
        })
        .catch(error => {
          console.log('error @ store.actions.getCsrs')
          console.log(error.response)
          console.log(error.message)
        })
    },

    getExams(context) {
      return new Promise((resolve, reject) => {
        let url = "/exams/"
        let filter = context.state.inventoryFilters["office_number"]

        if (filter === "default") {
          url += `?office_number=${context.state.user.office.office_number}`
        } else {
          url += `?office_number=${filter}`
        }

        Axios(context).get(url)
          .then(resp => {
            context.commit('setExams', resp.data.exams)
            resolve(resp)
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      })
    },

    getExamEventIDs(context, id){
      return new Promise((resolve, reject) => {
        let url = `/exams/event_id/${id}/`
        Axios(context).get(url).then(resp=>{
          context.commit('setExamEventIDs', resp.data.message)
          resolve(resp.data)
        }, error => {
          reject(error)
        })
      })
    },

    getExamsForOffice(context, office_number) {
      return new Promise((resolve, reject) => {
        let url = "/exams/"

        if (office_number === "default") {
          url += `?office_number=${context.state.user.office.office_number}`
        } else {
          url += `?office_number=${office_number}`
        }

        Axios(context).get(url)
          .then(resp => {
            context.commit('setExams', resp.data.exams)
            resolve(resp)
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      })
    },

    getExamsExport(context, url) {
      return new Promise((resolve, reject) => {
        Axios(context).get(url)
          .then(resp => {
            resolve(resp)
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      })
    },

    getExamTypes(context) {
      return new Promise((resolve, reject) => {
        Axios(context).get('/exam_types/')
          .then(resp => {
            context.commit('setExamTypes', resp.data.exam_types)
            resolve(resp.data.exam_types)
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      })
    },

    getInvigilators(context) {
      return new Promise ((resolve, reject) => {
        Axios(context).get('/invigilators/')
          .then(resp => {
            context.commit('setInvigilators', resp.data.invigilators)
            resolve(resp)
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      })
    },

    getInvigilatorsWithShadowFlag(context) {
      return new Promise ((resolve, reject) => {
        Axios(context).get('/invigilators/')
          .then(resp => {
            context.commit('setInvigilators', resp.data.invigilators)
            resolve(resp)
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      })
    },

    getOffices(context, payload=null) {
      if (context.state.user.liaison_designate === 1 || payload === 'force' || context.state.user.pesticide_designate === 1) {
        return new Promise((resolve, reject) => {
          Axios(context).get('/offices/').then(resp => {
            context.commit('setOffices', resp.data.offices)
            resolve(resp.data.offices)
          })
            .then(error => {
              reject(error)
            })
        })
      }
    },

    getRooms(context) {
      return new Promise((resolve, reject) => {
        Axios(context).get('/rooms/')
          .then(resp => {
            let resources = []
            if (resp.data.rooms.length > 0) {
              resources = resp.data.rooms.map(room =>
                ({
                  id: room.room_id,
                  title: room.room_name,
                  eventColor: room.color
                })
              )
            }
            resources.push({
              id: '_offsite',
              title: 'Offsite',
              eventColor: '#F58B4C'
            })
            context.commit('setRooms', resp.data.rooms)
            context.commit('setResources', resources)
            resolve(resources)
          })
          .catch( error => {
            reject(error)
          })
      })
    },

    getServices(context) {
      let office_id = context.state.user.office_id
        Axios(context).get(`/services/?office_id=${office_id}`)
          .then( resp => {
            let services = resp.data.services.filter(service => service.actual_service_ind === 1)
            context.commit('setServices', services)
          })
          .catch(error => {
            console.log('error @ store.actions.getServices')
            console.log(error.response)
            console.log(error.message)
          })
    },

    getUser(context) {
      return new Promise((resolve, reject) => {
        let url = '/csrs/me/'
        Axios(context).get(url).then(resp=>{
          context.commit('setUser', resp.data.csr)
          let officeType = resp.data.csr.office.sb.sb_type
          context.commit('setOffice', officeType)
          context.commit('setDefaultCounter', resp.data.csr.office.counters.filter(
            c => c.counter_name === DEFAULT_COUNTER_NAME)[0])
          context.commit('setBackOfficeDisplay', resp.data.back_office_display)
          context.commit('setRecurringFeatureFlag', resp.data.recurring_feature_flag)
          let examManagerBoolean = resp.data.attention_needed

          if (examManagerBoolean === true) {
            context.commit('setExamAlert', 'Office Exam Manager Action Items are present')
          }
          else {
            context.commit('setExamAlert', '')
          }

          if (resp.data.active_citizens && resp.data.active_citizens.length > 0) {
            context.dispatch('checkForUnfinishedService', resp.data.active_citizens)
          }
          resolve(resp)
        }, error => {
          context.commit('setLoginAlert', "You are not setup in TheQ, please contact RMSHelp to be setup.")
          reject(error)
        })
      })
    },

    cancelAddCitizensModal(context) {
      let { citizen_id } = context.getters.form_data.citizen

      context.dispatch('postCitizenLeft', citizen_id)
        .then( () => {
          context.commit('toggleAddModal', false)
          context.commit('resetAddModalForm')
        })
    },

    clickAddCitizen(context) {
      context.commit('setDisplayServices', 'Dashboard')
      context.commit('setPerformingAction', true)
      context.dispatch('toggleModalBack')
      context.commit('toggleAddModal', true)

      Axios(context).post('/citizens/', {})
        .then(resp => {
            let value = resp.data.citizen
            context.commit('updateAddModalForm', {type:'citizen',value})
            context.commit('resetServiceModal')
          },
          error => {
            context.commit('toggleAddModal', false)
            context.commit('setMainAlert', 'An error occurred adding a citizen.')
            context.commit('toggleServeCitizenSpinner', false)
          }).finally(() => {
            context.commit('setPerformingAction', false)
          })
      if (context.state.categories.length === 0) {
        context.dispatch('getCategories')
      }
      if (context.state.channels.length === 0) {
        context.dispatch('getChannels').then( () => {
          context.commit('setDefaultChannel')
        })
      }
      if (context.state.channels.length > 0) {
        context.commit('setDefaultChannel')
      }
      if (context.state.services.length === 0) {
        context.dispatch('getServices')
      }
    },

    clickAddService(context) {
      context.commit('setDisplayServices', 'All')
      context.commit('setPerformingAction', true)

      if (context.state.channels.length === 0) {
        context.dispatch('getCategories')
        context.dispatch('getChannels')
        context.dispatch('getServices')
      }

      context.commit('toggleAddNextService', true)

      context.dispatch('putServiceRequest').then(response => {
        context.dispatch('putCitizen').then(() => {
          context.commit('switchAddModalMode', 'add_mode')
          context.commit('updateAddModalForm', {
            type: 'citizen',
            value: context.getters.invited_citizen
          })
          context.commit('updateAddModalForm', {
            type: 'channel',
            value: context.getters.active_service.channel_id
          })
          context.commit('updateAddModalForm', {
            type: 'counter',
            value: context.getters.invited_citizen.counter_id
          })
          context.commit('updateAddModalForm', {
            type: 'priority',
            value: context.getters.invited_citizen.priority
          })
          context.commit('toggleAddModal', true)
          context.commit('toggleServiceModal', false)
        }).finally(() => {
          context.commit('setPerformingAction', false)
        })
      }, error => {
        console.log(error)
        context.commit('setPerformingAction', false)
      })
    },

    clickAddServiceApply(context) {
      context.commit('setPerformingAction', true)

      context.dispatch('postServiceReq').then(() => {
        context.dispatch('putCitizen').then((resp) => {
          context.commit('toggleAddModal', false)
          context.commit('toggleAddNextService', false)
          context.commit('toggleServiceModal', true)
          context.dispatch('toggleModalBack')
          context.commit('resetAddModalForm')
        }).finally(() => {
          context.commit('setPerformingAction', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
      })
    },

    clickAddToQueue(context) {
      let { citizen_id } = context.getters.form_data.citizen
      context.commit('setPerformingAction', true)

      context.dispatch('putCitizen').then( () => {
        context.dispatch('postServiceReq').then( () => {
          context.dispatch('postAddToQueue', citizen_id).then( resp => {
            context.dispatch('resetAddCitizenModal')
            context.commit('toggleBegunStatus', false)
            context.commit('toggleInvitedStatus', false)
          }).finally(() => {
            context.commit('setPerformingAction', false)
          })
        }).catch(() => {
          context.commit('setPerformingAction', false)
          context.commit('toggleServeCitizenSpinner', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
      })
    },

    clickAddExamSubmit(context, type) {
      return new Promise((resolve, reject) => {
        if (type === 'challenger') {
          context.dispatch('postITAChallengerExam').then(() => {
            resolve('success')
          }).catch(() => { reject('failed') })
        }
        if (type === 'group') {
          context.dispatch('postITAGroupExam').then(() => {
            resolve('success')
          }).catch(() => { reject('failed') })
        }
        if (type === 'individual') {
          context.dispatch('postITAIndividualExam').then(() => {
            resolve('success')
          }).catch(() => { reject('failed') })
        }
      })
    },

    clickAdmin(context) {
      context.commit('toggleShowAdmin')
    },

    clickBeginService(context, payload) {
      context.commit('setPerformingAction', true)
      context.commit('toggleServeCitizenSpinner', true)
      let { citizen_id } = context.getters.form_data.citizen
      context.dispatch('putCitizen').then( () => {
        context.dispatch('postServiceReq').then( () => {
          context.dispatch('postBeginService', citizen_id).then( () => {
            context.commit('toggleAddModal', false)
            context.commit('toggleBegunStatus', true)
            context.commit('toggleInvitedStatus', false)
            if (!payload.simple) {
              context.commit('toggleServiceModal', true)
            }
            context.commit('resetAddModalForm')
          }).finally(() => {
            context.commit('setPerformingAction', false)
          })
        }).catch(() => {
          context.commit('setPerformingAction', false)
          context.commit('toggleServeCitizenSpinner', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
        context.commit('toggleServeCitizenSpinner', false)
      })
    },

    clickQuickServe(context) {
      context.commit('setPerformingAction', true)

      if (context.state.channels.length === 0) {
        context.dispatch('getChannels').then( () => {
          context.commit('setDefaultChannel')
        })
      }
      if (context.state.channels.length > 0) {
        context.commit('setDefaultChannel')
      }

      Axios(context).post('/citizens/', {})
        .then(resp => {
          let value = resp.data.citizen
          context.commit('updateAddModalForm', {type:'citizen',value})
          context.commit('resetServiceModal')
          context.dispatch('putCitizen').then( () => {
            context.dispatch('postServiceReq').then( () => {
              context.dispatch('postBeginService', value.citizen_id).then( () => {
                context.commit('toggleAddModal', false)
                context.commit('toggleBegunStatus', true)
                context.commit('toggleInvitedStatus', false)
                context.commit('toggleServiceModal', true)
                context.commit('resetAddModalForm')
              }).finally(() => {
                context.commit('setPerformingAction', false)
              })
            }).catch(() => {
              context.commit('setPerformingAction', false)
            })
          }).catch(() => {
            context.commit('setPerformingAction', false)
          })
        },
        error => {
          context.commit('setMainAlert', 'An error occurred adding a citizen.')
          context.commit('toggleServeCitizenSpinner', false)
        })

      if (context.state.channels.length === 0) {
        context.dispatch('getChannels').then( () => {
          context.commit('setDefaultChannel')
        })
      }
      if (context.state.channels.length > 0) {
        context.commit('setDefaultChannel')
      }
      if (context.state.services.length === 0) {
        context.dispatch('getServices')
      }
    },

    clickBackOffice(context) {
      context.commit('setDisplayServices', context.state.backOfficeDisplay)
      context.commit('setPerformingAction', true)
      context.dispatch('toggleModalBack')

      Axios(context).post('/citizens/', {})
        .then(resp => {
          let value = resp.data.citizen
          context.commit('updateAddModalForm', {type:'citizen',value})
          context.commit('toggleAddModal', true)
          context.commit('resetServiceModal')
        }).finally(() => {
          context.commit('setPerformingAction', false)
        })

      let setupChannels = () => {
        let index = -1
        let { channel_options } = context.getters
        channel_options.forEach((opt,i) => {
          if (opt.text.toLowerCase() === 'back office') {
            index = i
          }
        })
        if (index >= 0) {
          context.commit('updateAddModalForm', {type:'channel', value:channel_options[index].value})
        } else {
          context.commit('setDefaultChannel')
        }
      }

      if (context.state.channels.length === 0) {
        context.dispatch('getChannels').then( () => { setupChannels() })
      } else {
        setupChannels()
      }
      if (context.state.categories.length === 0) {
        context.dispatch('getCategories')
      }
      if (context.state.services.length === 0) {
        context.dispatch('getServices')
      }
    },

    clickQuickBackOffice(context) {
      context.commit('setPerformingAction', true)
      context.dispatch('toggleModalBack')

      Axios(context).post('/citizens/', {})
        .then(resp => {
          let value = resp.data.citizen
          context.commit('updateAddModalForm', {type:'citizen',value})
          context.commit('resetServiceModal')
          context.dispatch('putCitizen').then( () => {
            context.dispatch('postServiceReq').then( () => {
              context.dispatch('postBeginService', value.citizen_id).then( () => {
                context.commit('toggleAddModal', false)
                context.commit('toggleBegunStatus', true)
                context.commit('toggleInvitedStatus', false)
                context.commit('toggleServiceModal', true)
                context.commit('resetAddModalForm')
              }).finally(() => {
                context.commit('setPerformingAction', false)
              })
            }).catch(() => {
              context.commit('setPerformingAction', false)
            })
          }).catch(() => {
            context.commit('setPerformingAction', false)
          })
        })

      let setupChannels = () => {
        let index = -1
        let { channel_options } = context.getters
        channel_options.forEach((opt,i) => {
          if (opt.text.toLowerCase() === 'back office') {
            index = i
          }
        })
        if (index >= 0) {
          context.commit('updateAddModalForm', {type:'channel', value:channel_options[index].value})
        } else {
          context.commit('setDefaultChannel')
        }
      }

      if (context.state.channels.length === 0) {
        context.dispatch('getChannels').then( () => { setupChannels() })
      } else {
        setupChannels()
      }
      if (context.state.categories.length === 0) {
        context.dispatch('getCategories')
      }
      if (context.state.services.length === 0) {
        context.dispatch('getServices')
      }
    },

    clickRefresh(context) {
      context.commit('setPerformingAction', true)
      const office_id = context.state.user.office_id
      Axios(context).get(`/services/refresh/?office_id=${office_id}`)
        .then(resp => {
          context.commit('setQuickList', resp.data.quick_list)
          context.commit('setBackOfficeList', resp.data.back_office_list)
        }).finally(() => {
        context.commit('setPerformingAction', false)
      })
    },

    clickCitizenLeft(context) {
      let {citizen_id} = context.getters.invited_citizen
      context.commit('setPerformingAction', true)

      context.dispatch('postCitizenLeft', citizen_id).finally(() => {
        context.commit('setPerformingAction', false)
      })
      context.commit('toggleServiceModal', false)
      context.commit('toggleBegunStatus', false)
      context.commit('toggleInvitedStatus', false)
      context.commit('resetServiceModal')
    },

    clickDashTableRow(context, citizen_id) {
      context.commit('toggleServeCitizenSpinner', true)
      context.commit('setPerformingAction', true)

      context.dispatch('postInvite', citizen_id).then( () => {
        context.commit('toggleBegunStatus', false)
        context.commit('toggleInvitedStatus', true)
        context.commit('toggleServiceModal', true)
      }).finally(() => {
        context.commit('setPerformingAction', false)
      })
    },

    clickEdit(context) {
      context.commit('setDisplayServices', 'All')
      context.commit('setPerformingAction', true)

      if (context.state.channels.length === 0) {
        context.dispatch('getCategories')
        context.dispatch('getChannels')
        context.dispatch('getServices')
      }

      context.dispatch('putServiceRequest').then(() => {
        context.dispatch('putCitizen').then(() => {
          context.commit('switchAddModalMode', 'edit_mode')
          context.dispatch('setAddModalData')
          context.commit('toggleAddModal', true)
          context.commit('toggleServiceModal', false)
          context.commit('setPerformingAction', false)
        }).finally(() => {
          context.commit('setPerformingAction', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
      })
    },

    clickEditApply(context) {
      context.commit('setPerformingAction', true)

      context.dispatch('putServiceRequest').then( () => {
        context.dispatch('putCitizen').then(() => {
          context.commit('toggleAddModal', false )
          context.dispatch('toggleModalBack' )
          context.commit('resetAddModalForm' )
          context.commit('toggleServiceModal', true )
        }).finally(() => {
          context.commit('setPerformingAction', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
      })
    },

    clickEditCancel(context) {
      context.commit('toggleAddModal', false)
      context.dispatch('toggleModalBack')
      context.commit('resetAddModalForm')
      context.commit('toggleServiceModal', true)
    },

    clickGAScreen(context) {
      context.dispatch('getCsrs').then( () => {
        context.commit('toggleGAScreenModal', !context.state.showGAScreenModal)
      })
    },

    clickHold(context) {
      let { citizen_id } = context.state.serviceModalForm
      context.commit('setPerformingAction', true)

      context.dispatch('putCitizen').then(() => {
        context.dispatch('putServiceRequest').then(() => {
          context.dispatch('postHold', citizen_id).then(() => {
            context.commit('toggleBegunStatus', false)
            context.commit('toggleInvitedStatus', false)
            context.commit('toggleServiceModal', false)
            context.commit('resetServiceModal')
          }).finally(() => {
            context.commit('setPerformingAction', false)
          })
        }).catch(() => {
          context.commit('setPerformingAction', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
      })
    },

    clickInvite(context) {
      context.commit('toggleInviteCitizenSpinner', true)
      context.commit('setPerformingAction', true)

      context.dispatch('postInvite', 'next').then(() => {
        context.commit('toggleInvitedStatus', true)
        context.commit('toggleServiceModal', true)
      }).catch(() => {
        // context.commit('setMainAlert', '(index) There are no citizens waiting.')
        context.commit('toggleInviteCitizenSpinner', false)
      }).finally(() => {
        context.commit('setPerformingAction', false)
        context.commit('toggleInviteCitizenSpinner', false)
      })
      context.dispatch('flashServeNow', 'stop')
    },

    checkForUnfinishedService(context, citizens) {

      if (context.state.serviceBegun || context.state.citizenInvited) {
        clearInterval(flashInt)
        context.commit('flashServeNow', 'btn-primary')
        return
      }
      if ( !( context.state.serviceBegun && context.state.citizenInvited ) ) {
        let citizenFound = false
        citizens.forEach(citizen => {
          if ( citizen.service_reqs.length > 0 ) {
            let activeService = citizen.service_reqs.filter(sr => sr.periods.some(p => p.time_end === null))
            if ( activeService[0].periods.length > 0 ) {
              let activePeriod = activeService[0].periods[activeService[0].periods.length - 1]
              if ( ( ['Invited', 'Being Served'].indexOf(activePeriod.ps.ps_name) > -1 )
                && activePeriod.csr.username === this.state.user.username ) {
                citizenFound = true

                if ( activePeriod.ps.ps_name === 'Invited' ) {
                  context.commit('setServiceModalForm', citizen)
                  context.commit('toggleInvitedStatus', true)
                  context.commit('toggleBegunStatus', false)
                  context.dispatch('flashServeNow', 'start')
                  context.commit('resetAddModalForm')
                } else if ( activePeriod.ps.ps_name === 'Being Served' ) {
                  context.commit('setServiceModalForm', citizen)
                  context.commit('toggleInvitedStatus', true)
                  context.commit('setServeNowAction', true)
                  context.dispatch('flashServeNow', 'start')
                  context.commit('resetAddModalForm')
                } else {
                  context.commit('toggleServiceModal', false)
                  context.commit('toggleBegunStatus', false)
                  context.commit('toggleInvitedStatus', false)
                  context.commit('resetAddModalForm')
                }
              }
            }
          }
        })

        if ( !citizenFound ) {
          context.commit('resetServiceModal')
          context.commit('toggleServiceModal', false)
          context.commit('toggleBegunStatus', false)
          context.commit('toggleInvitedStatus', false)
        }
      }
    },

    clickMakeActive(context, sr_id) {
      context.commit('setPerformingAction', true)

      context.dispatch('putServiceRequest').then(() => {
        context.dispatch('putCitizen').then(() => {
          context.dispatch('postActivateServiceReq', sr_id).finally(() => {
            context.commit('setPerformingAction', false)
          }).finally(() => {
            context.commit('setPerformingAction', false)
          })
        }).catch(() => {
          context.commit('setPerformingAction', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
      })
    },

    clickReturnToQueue(context) {
      let {citizen_id} = context.getters.invited_citizen
      context.commit('setPerformingAction', true)

      context.dispatch('putCitizen').then( () => {
        context.dispatch('putServiceRequest').then( () => {
          context.dispatch('postAddToQueue', citizen_id).then( () => {
            context.commit('toggleInvitedStatus', false)
            context.commit('toggleServiceModal', false)
            context.commit('resetServiceModal')
          }).finally(() => {
            context.commit('setPerformingAction', false)
          })
        }).catch(() => {
          context.commit('setPerformingAction', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
      })
    },

    clickRowHoldQueue(context, citizen_id) {
      context.commit('toggleServeCitizenSpinner', true)
      context.commit('setPerformingAction', true)

      context.dispatch('postBeginService', citizen_id).then( () => {
        context.commit('toggleBegunStatus', true)
        context.commit('toggleInvitedStatus', false)
        context.commit('toggleServiceModal', true)
      }).finally(() => {
        context.commit('setPerformingAction', false)
      })
    },

    toggleBegunStatus({commit}) {
      commit('toggleBegunStatus', payload)
    },

    toggleInvitedStatus(context, payload) {
      context.commit('toggleInvitedStatus', payload)
    },

    clickServeNow(context) {
      if (context.state.serveNowAltAction) {
        context.commit('toggleBegunStatus', true)
        context.commit('toggleInvitedStatus', false)
      }
      context.commit('toggleServiceModal', true)
      context.dispatch('flashServeNow', 'stop')
    },

    clickServiceBeginService(context) {
      context.commit('setPerformingAction', true)
      context.commit('toggleServeCitizenSpinner', true)
      let { citizen_id } = context.state.serviceModalForm


      context.dispatch('putCitizen').then( () => {
        context.dispatch('putServiceRequest').then( () => {
          context.dispatch('postBeginService', citizen_id).then(() => {
            context.commit('toggleBegunStatus', true)
          }).finally(() => {
            context.commit('setPerformingAction', false)
          })
        }).catch(() => {
          context.commit('setPerformingAction', false)
          context.commit('toggleServeCitizenSpinner', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
        context.commit('toggleServeCitizenSpinner', false)
      })
    },

    clickServiceFinish(context) {
      let { citizen_id } = context.state.serviceModalForm
      let { accurate_time_ind } = context.state.serviceModalForm
      let inaccurate_flag = 'true'
      if ((accurate_time_ind === null) || (accurate_time_ind === 1)) {
        inaccurate_flag = 'false'
      }
      context.commit('setPerformingAction', true)
      context.commit('toggleServeCitizenSpinner', true)

      context.dispatch('putCitizen').then( (resp) => {
        context.dispatch('putServiceRequest').then( () => {
          context.dispatch('postFinishService', {citizen_id, inaccurate:inaccurate_flag}).then( () => {
            context.commit('toggleServiceModal', false)
            context.commit('toggleBegunStatus', false)
            context.commit('toggleInvitedStatus', false)
            context.commit('resetServiceModal')
          }).finally(() => {
            context.commit('setPerformingAction', false)
          })
        }).catch(() => {
          context.commit('setPerformingAction', false)
          context.commit('toggleServeCitizenSpinner', false)
        })
      }).catch(() => {
        context.commit('setPerformingAction', false)
        context.commit('toggleServeCitizenSpinner', false)
      })
    },

    finishServiceFromGA(context, citizen_id) {
      context.dispatch('postFinishService', {citizen_id, inaccurate:'true'})
    },

    clickServiceModalClose(context) {
      context.commit('toggleServiceModal', false)
      context.commit('toggleInvitedStatus', true)
    },

    closeGAScreenModal(context) {
      context.commit('toggleGAScreenModal', false)
    },

    initializeAgenda(context) {
      return new Promise((resolve, reject) => {
        context.dispatch('getExams').then( () => {
          context.dispatch('getBookings').then( () => resolve() )
        })
      })
    },

    messageFeedback(context) {
      let messageParts = []
      messageParts.push(`Username: ${context.state.user.username}`)
      messageParts.push(`Office: ${context.state.user.office.office_name}`)

      let activeCitizen = context.state.serviceModalForm.service_citizen

      if (activeCitizen) {
        let activeService = activeCitizen.service_reqs.filter(sr => sr.periods.some(p => p.time_end === null))[0]
        let activePeriod = activeService.periods.filter(p => p.time_end === null)[0]

        messageParts.push(`Ticket Number: ${activeCitizen.ticket_number}`)
        messageParts.push(`Citizen ID: ${activeCitizen.citizen_id}`)
        messageParts.push(`Active SR ID: ${activeService.sr_id}`)
        messageParts.push(`Active Period ID: ${activePeriod.period_id}`)
      } else {
        messageParts.push(`Ticket Number: not available`)
      }
      messageParts.push("")
      messageParts.push(`Message: ${context.state.feedbackMessage}`)

      let feedbackObject = {
        feedback_message: messageParts.join("\n")
      }

      let url = "/feedback/"
      Axios(context).post(url, feedbackObject).then(()=> {
        context.commit('setFeedbackMessage', '')
      })
    },

    postActivateServiceReq(context, sr_id) {
      return new Promise((resolve, reject) => {
        let url = `/service_requests/${sr_id}/activate/`
        Axios(context).post(url).then(resp=>{
          resolve(resp)
        }, error => {
          reject(error)
        })
      })
    },

    postAddToQueue(context, citizen_id) {
      return new Promise((resolve, reject) => {
        let url = `/citizens/${citizen_id}/add_to_queue/`
        Axios(context).post(url,{}).then(resp=>{
          resolve(resp)
        }, error => {
          reject(error)
        })
      })
    },

    postBeginService(context, citizen_id) {
      return new Promise((resolve, reject) => {
        let url = `/citizens/${citizen_id}/begin_service/`
        Axios(context).post(url,{})
          .then(resp => {
              resolve(resp)
            },
            error => {
              if (error.response.status === 400) {
                context.commit('setMainAlert', error.response.data.message)
              }
              reject(error)
            })
      })
    },

    postCitizenLeft(context, citizen_id) {
      return new Promise((resolve, reject) => {
        let url = `/citizens/${citizen_id}/citizen_left/`
        Axios(context).post(url).then(resp=>{
          resolve(resp)
        }, error => {
          reject(error)
        })
      })
    },

    postFinishService(context, payload) {
      return new Promise((resolve, reject) => {
        let url = `/citizens/${payload.citizen_id}/finish_service/?inaccurate=${payload.inaccurate}`
        Axios(context).post(url).then(resp=>{
          resolve(resp)
        }, error => {
          reject(error)
        })
      })
    },

    postHold(context, citizen_id) {
      return new Promise((resolve, reject) => {
        let url = `/citizens/${citizen_id}/place_on_hold/`
        Axios(context).post(url).then(resp=>{
          resolve(resp)
        }, error => {
          reject(error)
        })
      })
    },

    postInvite(context, payload) {
      let { counter_id } = context.state.user

      let data = { counter_id }
      if (payload==='next') {
        return new Promise((resolve, reject) => {
          let url = `/citizens/invite/`
          Axios(context).post(url, data).then(resp=>{
            resolve(resp)
          }, error => {
            reject(error)
          })
        })
      } else {
        return new Promise((resolve, reject) => {
          let url = `/citizens/${payload}/invite/`
          Axios(context).post(url, data).then(resp=>{
            resolve(resp)
          }, error => {
            if (error.response.status === 400) {
              context.commit('setMainAlert', error.response.data.message)
            }
            reject(error)
          })
        })
      }
    },

    scheduleExam(context, payload) {
      return new Promise((resolve, reject) => {
        context.dispatch('postBooking', payload).then(booking_id => {
          context.dispatch('putExam', booking_id).then( () => {
            resolve()
          })
        })
      })

    },

    putExam(context, payload) {
      let bookingId, examId
      if (typeof payload === 'object' && payload !== null) {
        bookingId = payload.bookingId
        examId = payload.examId
      } else {
        bookingId = payload
        examId = context.state.selectedExam.exam_id
      }
      return new Promise((resolve, reject) => {
        let url = `/exams/${examId}/`
        Axios(context).put(url, {booking_id: bookingId}).then( resp =>{
          resolve(resp)
        })
          .catch(error => {
            reject(error)
          })
      })
    },

    putExamInfo(context, payload) {
      let id = payload.exam_id.valueOf()
      delete payload.exam_id
      return new Promise((resolve, reject) => {
        let url = `/exams/${id}/`
        Axios(context).put(url, payload).then( () =>{
          context.dispatch('getExams').then( () => {
            context.commit('setEditExamSuccess', 3)
            resolve()
          })
        })
      })
    },

    postBooking(context, payload) {
      if (!Object.keys(payload).includes('office_id')) {
        payload['office_id'] = context.state.user.office_id
      }
      return new Promise((resolve, reject) => {
        Axios(context).post('/bookings/', payload).then( resp => {
          resolve(resp.data.booking.booking_id)
        })
          .catch(error => {
            reject(error)
          })
      })
    },

    finishBooking(context) {
      context.dispatch('getBookings')
      context.commit('setSelectionIndicator', false)
      context.commit('toggleScheduling', false)
      context.commit('toggleBookingModal', false)
      context.commit('toggleOtherBookingModal', false)
      context.commit('setClickedDate', null)
      context.commit('setSelectedExam', null)
      context.commit('setEditedBooking', null)
      context.commit('toggleEditBookingModal', false)
      context.commit('toggleEditGroupBookingModal', false)
    },

    postITAChallengerExam(context) {
      let responses = Object.assign( {}, context.state.capturedExam)
      let date = new moment(responses.expiry_date).local().format('YYYY-MM-DD')
      let time = new moment(responses.exam_time).local().format('HH:mm:ss')
      let datetime = date+'T'+time
      let start = new moment(datetime).local()
      let end = start.clone().add(4, 'hours')
      let booking = {
        start_time: start.clone().utc().format('YYYY-MM-DD[T]HH:mm:ssZ'),
        end_time: end.clone().utc().format('YYYY-MM-DD[T]HH:mm:ssZ'),
        fees: 'false',
        booking_name: responses.exam_name,
        office_id: context.state.user.office_id,
      }
      if (responses.on_or_off === 'on') {
        booking.room_id = responses.offsite_location.id.valueOf()
        delete responses.offsite_location
      }
      if (responses.invigilator) {
        if (responses.invigilator === 'sbc') {
          booking.invigilator_id = null
          booking.sbc_staff_invigilated = true
        } else {
          booking.invigilator_id = responses.invigilator.invigilator_id.valueOf()
        }
        delete responses.invigilator
      }
      let exam_type= context.state.examTypes.find(ex => ex.exam_type_name === 'Monthly Session Exam')
      let defaultValues = {
        exam_returned_ind: 0,
        examinee_name: 'Monthly Session',
        exam_type_id: exam_type.exam_type_id,
        office_id: context.state.user.office_id,
        exam_method: 'paper',
      }
      delete responses.exam_time
      delete responses.expiry_date
      if (responses.notes === null) {
        data.notes = ''
      }
      let postData = {...responses, ...defaultValues}

      return new Promise((resolve, reject) => {
        Axios(context).post('/exams/', postData).then( examResp => {
          let { exam_id } = examResp.data.exam
          context.dispatch('postBooking', booking).then( bookingResp => {
            let putObject = {
              examId: exam_id,
              bookingId: bookingResp,
              officeId: responses.office_id
            }
            context.dispatch('putExam', putObject).then( () => {
              resolve()
            }).catch( () => { reject() })
          }).catch( () => { reject() })
        }).catch( () => { reject() })
      })
    },

    postITAGroupExam(context) {
      let responses = Object.assign( {}, context.state.capturedExam)
      let timezone_name = context.state.user.office.timezone
      let booking_office = context.state.offices.find(office => office.office_id == responses.office_id)
      let booking_timezone_name = booking_office.timezone.timezone_name
      let date = new moment(responses.expiry_date).format('YYYY-MM-DD')
      let time = new moment(responses.exam_time).format('HH:mm:ss')
      let datetime = date+'T'+time
      let start
      if (booking_timezone_name != timezone_name) {
        start = new tZone.tz(datetime, booking_timezone_name)
      } else {
        start = new moment(datetime).local()
      }
      let length = context.state.examTypes.find(ex => ex.exam_type_id == responses.exam_type_id).number_of_hours
      let end = start.clone().add(length, 'hours')
      let booking = {
        start_time: start.clone().utc().format('YYYY-MM-DD[T]HH:mm:ssZ'),
        end_time: end.clone().utc().format('YYYY-MM-DD[T]HH:mm:ssZ'),
        fees: 'false',
        booking_name: responses.exam_name,
        office_id: responses.office_id,
      }
      let defaultValues = {
        exam_returned_ind: 0,
        examinee_name: 'group exam',
      }
      delete responses.exam_time
      delete responses.expiry_date
      if (responses.notes === null) {
        data.notes = ''
      }
      let postData = {...responses, ...defaultValues}

      return new Promise((resolve, reject) => {
        Axios(context).post('/exams/', postData).then( examResp => {
          let { exam_id } = examResp.data.exam
          context.dispatch('postBooking', booking).then( bookingResp => {
            let putObject = {
              examId: exam_id,
              bookingId: bookingResp,
              officeId: responses.office_id
            }
            context.dispatch('putExam', putObject).then( () => {
              resolve()
            }).catch( () => { reject() })
          }).catch( () => { reject() })
        }).catch( () => { reject() })
      })
    },

    postITAIndividualExam(context) {
      let responses = Object.assign( {}, context.state.capturedExam)
      if (responses.on_or_off) {
        if (responses.on_or_off === 'off') {
          responses.offsite_location = '_offsite'
        }
        delete responses.on_or_off
      }
      responses.office_id = responses.office_id ? responses.office_id : context.state.user.office_id
      let defaultValues = {
        exam_returned_ind: 0,
        number_of_students: 1
      }
      let exp = new moment(responses.expiry_date).format('YYYY-MM-DD').toString()
      responses.expiry_date = new moment(exp).utc().format('YYYY-MM-DD[T]HH:mm:ssZ')
      if (responses.exam_received_date) {
        responses.exam_received_date = new moment(responses.exam_received_date).utc().format('YYYY-MM-DD[T]HH:mm:ssZ')
      }
      if (responses.notes === null) {
        responses.notes = ''
      }
      if (context.state.addExamModal.setup === 'other') {
        if (context.state.captureITAExamTabSetup.showRadio === true) {
          delete responses.exam_received_date
        }
      }
      let postData = {...responses, ...defaultValues}

      return new Promise((resolve, reject) => {
        Axios(context).post('/exams/', postData).then( () => { resolve() }).catch( () => { reject() })
      })
    },

    postServiceReq(context) {
      let { form_data } = context.getters
      let { citizen_id } = form_data.citizen
      let { priority } = form_data.priority
      let service_request = {
        service_id: form_data.service,
        citizen_id: citizen_id,
        quantity: 1,
        channel_id: form_data.channel,
        priority: priority
      }

      return new Promise((resolve, reject) => {
        let url = `/service_requests/`
        Axios(context).post(url, {service_request}).then(resp=>{
          resolve(resp)
        }, error => {
          reject(error)
        })
      })
    },

    putCitizen(context) {
      let data = {}
      let citizen_id
      let priority
      let counter

      if (context.state.serviceModalForm.citizen_id) {
        let { accurate_time_ind, citizen_comments } = context.state.serviceModalForm
        counter = context.state.serviceModalForm.counter
        priority = context.state.serviceModalForm.priority
        citizen_id = context.state.serviceModalForm.citizen_id
        let prevCitizen = context.getters.invited_citizen

        if (!context.state.showAddModal) {
          if ( citizen_comments !== prevCitizen.citizen_comments ) {
            data.citizen_comments = citizen_comments
          }
          if ( counter !== prevCitizen.counter_id ) {
            data.counter_id = counter
          }
          if ( priority !== prevCitizen.priority ) {
            data.priority = priority
          }
          if ( accurate_time_ind != null && accurate_time_ind !== prevCitizen.accurate_time_ind ) {
            data.accurate_time_ind = accurate_time_ind
          }
        }
      } else {
        let { form_data } = context.getters
        citizen_id = form_data.citizen.citizen_id
        data.counter_id = form_data.counter
        data.priority = form_data.priority
        data.citizen_comments = form_data.comments
      }

      if (Object.keys(data).length === 0) {
        return new Promise((resolve, reject) => { resolve(' ') })
      }

      return new Promise((resolve, reject) => {
        let url = `/citizens/${citizen_id}/`

        Axios(context).put(url, data).then(resp => { resolve(resp) },
          error => { reject(error) })
      })
    },

    putServiceRequest(context) {
      let { activeQuantity } = context.state.serviceModalForm
      let compareService = context.getters.active_service
      let { sr_id } = compareService

      let data = {}
      if (activeQuantity != compareService.quantity) {
        data.quantity = activeQuantity
      }

      // Make sure quantity is position
      if (!/^\+?\d+$/.test(activeQuantity)) {
        context.commit("setServeModalAlert", "Quantity must be a number and greater than 0")
        return Promise.reject('Quantity must be a number and greater than 0')
      } else {
        context.commit("setServeModalAlert", "")
      }

      let setup = context.state.addModalSetup
      let { form_data } = context.getters
      if ( setup === 'add_mode' || setup === 'edit_mode') {
        if (form_data.channel != compareService.channel_id) {
          data.channel_id = form_data.channel
        }
        if (form_data.service != compareService.service_id) {
          data.service_id = form_data.service
        }
      }
      if (Object.keys(data).length === 0) {
        return new Promise((resolve, reject) => { resolve(' ') })
      }

      return new Promise((resolve, reject) => {
        let url = `/service_requests/${sr_id}/`
        Axios(context).put(url,data).then(resp=>{
          resolve(resp)
        }, error => {
          reject(error)
        })
      })
    },

    resetAddCitizenModal(context) {
      context.commit('toggleAddModal', false)
      context.dispatch('toggleModalBack')
      context.commit('resetAddModalForm')
      context.commit('toggleServeCitizenSpinner', false)
    },

    screenAllCitizens(context, route) {
      context.state.citizens.forEach( citizen =>{
        let payload = {
          citizen,
          route
        }
        context.dispatch('screenIncomingCitizen', payload)
      })
    },

    screenIncomingCitizen(context, payload) {
      let { addNextService } = context.state
      let { csr_id } = context.state.user
      let { citizen, route } = payload
      function checkPath() {
        if (route && route.path && route.path === '/queue') {
          return true
        }
        return false
      }
      if (citizen.service_reqs.length > 0) {
        if ( citizen.service_reqs[0].periods) {
          let filteredService = citizen.service_reqs.filter(sr => sr.periods.some(p => p.time_end === null))
          if (filteredService.length > 0) {
            let activeService = filteredService[0]
            if ( activeService.periods.length > 0 ) {
              let l = activeService.periods.length - 1
              let activePeriod = activeService.periods[l]
              if ( activePeriod.csr_id === csr_id ) {
                if (activePeriod.ps.ps_name === 'Invited') {
                  context.commit('setServiceModalForm', citizen)
                  context.commit('toggleBegunStatus', false)
                  context.commit('toggleInvitedStatus', true)
                  context.commit('setServeNowAction', true)
                  context.dispatch('flashServeNow', 'start')

                  if (!addNextService && checkPath() ) {
                    context.commit('toggleServiceModal', true)
                    context.commit('resetAddModalForm')
                  }

                } else if (activePeriod.ps.ps_name === 'Being Served') {
                  context.commit('setServiceModalForm', citizen)
                  context.commit('toggleBegunStatus', true)
                  context.commit('toggleInvitedStatus', false)
                  context.commit('setServeNowAction', false)
                  context.dispatch('flashServeNow', 'stop')

                  if (!addNextService && checkPath() ) {
                    context.commit('toggleServiceModal', true)
                    context.commit('resetAddModalForm')
                  }
                } else {
                  if ( checkPath() ) {
                    context.commit('resetServiceModal')
                    context.commit('toggleServiceModal', false)
                  }
                  context.commit('toggleInvitedStatus', false)
                  context.commit('toggleBegunStatus', false)
                  context.dispatch('flashServeNow', 'stop')
                  context.commit('resetAddModalForm')
                }
              }
            }
            //Citizen is completed or left
          } else {
            //Ensure that we only close serve citizen if it's the citizen _we're_ editing that was finished
            let mostRecentActivePeriod = citizen.service_reqs[0].periods[0]
            citizen.service_reqs.forEach((request) => {
              request.periods.forEach((period) => {
                if (period.time_end > mostRecentActivePeriod.time_end) {
                  mostRecentActivePeriod = period
                }
              })
            })

            if (mostRecentActivePeriod.csr_id === csr_id) {
              if ( checkPath() ) {
                context.commit('resetServiceModal')
                context.commit('toggleServiceModal', false)
              }
              context.commit('toggleInvitedStatus', false)
              context.commit('toggleBegunStatus', false)
              context.dispatch('flashServeNow', 'stop')
            }
          }
        }
      }
      const index = context.state.citizens.map(c => c.citizen_id).indexOf(citizen.citizen_id);

      if (index >= 0) {
        context.commit('updateCitizen', {citizen, index})
        context.commit('toggleServeCitizenSpinner', false)

      } else {
        if (citizen.service_reqs && citizen.service_reqs.length > 0) {
          if (citizen.service_reqs[0].periods && citizen.service_reqs[0].periods.length > 0) {
            context.commit('addCitizen', citizen)
          }
        }
      }
    },

    setAddModalData(context) {
      let data = {
        citizen: context.getters.invited_citizen,
        active_service: context.getters.active_service
      }
      context.commit('setAddModalData', data)
    },

    toggleModalBack(context) {
      if (context.state.user.office.sb.sb_type === "nocallonsmartboard") {
        context.commit('switchAddModalMode', 'non_reception')
      } else {
        context.commit('switchAddModalMode', 'reception')
      }
    },

    updateCSRCounterTypeState(context) {
      let csr_id = context.state.user.csr_id
      Axios(context).put(`/csrs/${csr_id}/`, {
        counter_id: context.state.user.counter_id,
        receptionist_ind: context.state.user.receptionist_ind
      })
    },

    updateCSRState(context) {
      let csr_id = context.state.user.csr_id
      Axios(context).put(`/csrs/${csr_id}/`, {
        csr_state_id: context.state.user.csr_state_id,
      })
    },

    restoreSavedModalAction({commit}, payload) {
      commit('restoreSavedModal', payload)
    },
  },

  mutations: {
    logIn: state => state.isLoggedIn = true,
    logOut: state => state.isLoggedIn = false,
    setBearer: (state, payload) => state.bearer = payload,
    setUser: (state, payload) => state.user = payload,
    updateQueue(state, payload) {
      state.citizens = []
      state.citizens = payload
    },
    setServices(state, payload) {
      state.services = {}
      state.services = payload
    },
    setChannels(state, payload) {
      state.channels = []
      state.channels = payload
    },
    setCategories(state, payload) {
      state.categories = []
      state.categories = payload
    },

    setReturnExamInfo: (state, payload) => state.returnExam = payload,

    setManifestData(state, payload) {
      state.manifestdata = ''
      state.manifestdata = payload
    },

    setDiskSpace(state, payload) {
      state.diskspace = {}
      state.diskspace = payload
    },

    setIsUploadingFile(state, payload) {
      state.isUploadingFile = payload
    },

    setVideoFiles(state, payload) {
      state.videofiles = []
      state.videofiles = payload
    },

    toggleAddModal: (state, payload) => state.showAddModal = payload,

    updateAddModalForm(state, payload) {
      Vue.set(
        state.addModalForm,
        payload.type,
        payload.value
      )
    },

    setAddModalSelectedItem(state, payload) {
      state.addModalForm.suspendFilter = true
      state.addModalForm.selectedItem = payload
    },

    resetAddModalForm(state) {
      let keys = Object.keys(state.addModalForm)
      keys.forEach(key => {
        switch (key) {
          case 'suspendFilter':
            Vue.set(
              state.addModalForm,
              key,
              false
            )
            break
          case 'priority':
            Vue.set(
              state.addModalForm,
              key,
              2
            )
            break
          case 'counter':
            Vue.set(
              state.addModalForm,
              key,
              _default_counter_id
            )
            break
          default:
            Vue.set(
              state.addModalForm,
              key,
              ''
            )
        }
      })
    },

    switchAddModalMode(state, payload) {
      state.addModalSetup = payload
    },

    setAddModalData(state, data) {
      let { citizen, active_service } = data

      let formData = {
        comments: citizen.citizen_comments,
        priority: citizen.priority,
        citizen: citizen,
        channel: active_service.channel_id,
        service: active_service.service_id
      }
      let keys = Object.keys(formData)
      keys.forEach(key => {
        Vue.set(
          state.addModalForm,
          key,
          formData[key]
        )
      })
    },

    toggleServiceModal: (state, payload) => state.showServiceModal = payload,

    setDisplayServices: (state, payload) => state.displayServices = payload,

    setBackOfficeDisplay: (state, payload) => state.backOfficeDisplay = payload,

    setRecurringFeatureFlag: (state, payload) => state.recurringFeatureFlag = payload,

    toggleBookingBlackoutModal: (state, payload) => state.showBookingBlackoutModal = payload,

    toggleEditDeleteSeries: (state, payload) => state.editDeleteSeries = payload,

    setServiceModalForm(state, citizen) {
      let citizen_comments = citizen.citizen_comments
      let activeService = citizen.service_reqs.filter(sr => sr.periods.some(p => p.time_end === null))
      let activeQuantity = activeService[0].quantity
      let { citizen_id } = citizen
      let service_citizen = citizen
      let priority = citizen.priority
      let counter = citizen.counter_id

      let obj = { citizen_comments, activeQuantity, citizen_id, service_citizen, priority, counter }
      let keys = Object.keys(obj)

      keys.forEach(key => {
        Vue.set(
          state.serviceModalForm,
          key,
          obj[key]
        )
      })
    },

    resetServiceModal(state) {
      let { serviceModalForm } = state
      let keys = Object.keys(serviceModalForm)
      Vue.set(
        state,
        "serveModalAlert",
        ""
      )

      keys.forEach(key => {
        if (key === 'activeQuantity') {
          Vue.set(
            state.serviceModalForm,
            key,
            1
          )
        } else {
          Vue.set(
            state.serviceModalForm,
            key,
            null
          )
        }
      })
    },

    editServiceModalForm(state, payload) {
      Vue.set(
        state.serviceModalForm,
        payload.type,
        payload.value
      )
    },

    setDefaultChannel(state) {
      let channel = state.channels.filter(ch => ch.channel_name === 'In Person')
      state.addModalForm.channel = channel[0].channel_id
    },

    setMainAlert(state, payload) {
      state.alertMessage = payload
      state.dismissCount = 5
    },

    setSelectedOffice(state, payload) {
      state.selectedOffice = payload
    },

    setExamAlert(state, payload) {
      state.examAlertMessage = payload
      if (payload) {
        state.examDismissCount = 999
      }
      else {
        state.examDismissCount = 0
      }
    },

    setLoginAlert(state, payload) {
      state.loginAlertMessage = payload
      state.loginDismissCount = 999
    },

    setExamEditSuccessCount(state, payload) {
      state.examEditSuccessCount = payload
    },

    setExamEditFailureCount(state, payload) {
      state.examEditFailCount = payload
    },

    setModalAlert(state, payload) {
      state.alertMessage = payload
    },

    setServeModalAlert(state, payload) {
      state.serveModalAlert = payload
    },

    setCsrs(state, payload) {
      state.csrs = []
      state.csrs = payload
    },

    setExams(state, payload) {
      state.exams = []
      state.exams = payload
    },

    setEventWarning(state, payload) {
      state.event_id_warning = payload
    },

    setExamEventIDs(state, payload) {
      state.event_ids = payload
    },

    setExamTypes(state, payload) {
      state.examTypes = []
      state.examTypes = payload
    },

    setInvigilators(state, payload) {
      state.invigilators = payload
    },

    updateCitizen(state, payload) {
      Vue.set(state.citizens, payload.index, payload.citizen)
    },

    addCitizen(state, citizen) {
      state.citizens.push(citizen)
    },

    dismissCountDown(state, payload) {
      state.dismissCount = payload
    },

    examDismissCountDown(state, payload) {
      state.examDismissCount = payload
    },

    loginDismissCountDown(state, payload) {
      state.loginDismissCount = payload
    },

    examSuccessCountDown(state, payload) {
      state.examSuccessDismiss = payload
    },

    toggleInvitedStatus: (state, payload) => state.citizenInvited = payload,

    toggleBegunStatus: (state, payload) => state.serviceBegun = payload,

    toggleGAScreenModal: (state, payload) => state.showGAScreenModal = payload,

    setReceptionistState: (state, payload) => {
      state.user.receptionist_ind = payload
    },

    setCounterStatusState: (state, payload) => {
      state.user.counter_id = payload
    },

    setCSRState: (state, payload) => state.user.csr_state_id = payload,

    setUserCSRStateName: (state, payload) => state.user.csr_state.csr_state_name = payload,

    setQuickList: (state, payload) => state.user.office.quick_list = payload,

    setBackOfficeList: (state, payload) => state.user.office.back_office_list = payload,

    setOffice: (state, officeType) => state.officeType = officeType,

    setDefaultCounter: (state, defaultCounter) => {
      state.addModalForm.counter = defaultCounter.counter_id
      state.serviceModalForm.counter = defaultCounter.counter_id
      _default_counter_id = defaultCounter.counter_id
    },

    flashServeNow: (state, payload) => state.serveNowStyle = payload,

    setServeNowAction: (state, payload) => state.serveNowAltAction = payload,

    toggleFeedbackModal: (state, payload) => state.showFeedbackModal = payload,

    toggleAddNextService: (state, payload) => state.addNextService = payload,

    toggleShowAdmin: (state) => state.showAdmin = !state.showAdmin,

    setFeedbackMessage: (state, payload) => state.feedbackMessage = payload,

    setPerformingAction: (state, payload) => state.performingAction = payload,

    setUserLoadingFail: (state, payload) => state.userLoadingFail = payload,

    showHideResponseModal(state) {
      state.showResponseModal = true
      setTimeout(() => {state.showResponseModal = false}, 3000)
    },

    hideResponseModal(state) {
      state.showResponseModal = false
    },

    setiframeLogedIn: (state, value) => state.iframeLogedIn = value,

    setNavigation: (state, value) => state.adminNavigation = value,

    setAddExamModalSetting(state, payload) {
      if (typeof payload === 'boolean') {
        state.addExamModal.visible = payload
        return
      }
      Object.keys(payload).forEach(key => {
        Vue.set(
          state.addExamModal,
          key,
          payload[key]
        )
      })
    },

    resetAddExamModal: (state) => {
      state.addExamModal = {
        visible: false,
        setup: null,
        step1MenuOpen: false,
        office_number: null,
      }
    },

    resetLogAnotherExamModal: (state, setup) => {
      state.addExamModal = {
        visible: true,
        setup: setup,
        step1MenuOpen: true,
        office_number: null,
      }
    },

    toggleGenFinReport(state, payload) {
      state.showGenFinReportModal = payload
    },

    captureExamDetail(state, payload) {
      if (payload.key === 'exam_type_id') {
        payload.value = Number(payload.value)
      }
      if (payload.key === 'event_id') {
        payload.value = payload.value.toString()
      }
      if (payload.value === null) {
        payload.value = ''
      }
      Vue.set(
        state.capturedExam,
        payload.key,
        payload.value
      )
    },

    resetCaptureForm(state) {
      state.capturedExam = {}
    },

    resetCaptureTab(state) {
      Object.entries({
        step: 1,
        highestStep: 1,
        stepsValidated: [],
        errors: [],
        showRadio: true,
        success: '',
        notes: false
      }).forEach(entry => {
        Vue.set(
          state.captureITAExamTabSetup,
          entry[0],
          entry[1]
        )
      })
    },

    updateCaptureTab(state, payload) {
      let keys = Object.keys(payload)
      keys.forEach(key => {
        Vue.set(
          state.captureITAExamTabSetup,
          key,
          payload[key]
        )
      })
    },

    toggleIndividualCaptureTabRadio(state, payload) {
      Vue.set(
        state.captureITAExamTabSetup,
        'showRadio',
        payload
      )
    },

    setBookings(state, payload) {
      state.bookings = payload
    },

    setRooms(state, payload) {
      state.rooms = payload
    },

    toggleBookingModal: (state, payload) => state.showBookingModal = payload,

    setClickedDate: (state, payload) => state.clickedDate = payload,

    toggleExamInventoryModal: (state, payload) => state.showExamInventoryModal = payload,

    toggleEditExamModal: (state, payload) => state.showEditExamModal = payload,

    toggleReturnExamModal: (state, payload) => state.showReturnExamModal = payload,

    toggleDeleteExamModalVisible: (state, payload) => state.showDeleteExamModal = payload,

    setSelectedExam(state, payload) {
      if (payload === 'clearGoto') {
        delete state.selectedExam.gotoDate
        return
      }
      state.selectedExam = payload
    },

    toggleScheduling: (state, payload) => {
      if (!payload) {
        state.scheduling = payload
        state.rescheduling = payload
        return
      }
      state.scheduling = payload
    },

    setCalendarSetup: (state, payload) => state.calendarSetup = payload,

    toggleOtherBookingModal: (state, payload) => state.showOtherBookingModal = payload,

    setEditExamSuccess: (state, payload) => state.editExamSuccessCount = payload,

    setEditExamFailure: (state, payload) => state.editExamFailureCount = payload,

    toggleEditBookingModal: (state, payload) => state.showEditBookingModal = payload,

    setEditedBooking(state, payload) {
      if (typeof payload === 'object' && payload !== null) {
        state.editedBooking = Object.assign({}, payload)
      }
      if (!payload) {
        state.editedBooking = null
        state.editedBookingOriginal = null
      }
    },

    toggleRescheduling: (state, payload) => state.rescheduling = payload,

    setEditedBookingOriginal: (state, payload) => state.editedBookingOriginal = payload,

    setOffices: (state, payload) => state.offices = payload,

    setOfficeFilter: (state, payload) => state.officeFilter = payload,

    setSelectionIndicator: (state, payload) => state.selectionIndicator = payload,

    setResources: (state, payload) => state.roomResources = payload,

    setEvents: (state, payload) => state.calendarEvents = payload,

    setInventoryEditedBooking(state, booking) {
      let bookingCopy = Object.assign({}, booking)
      state.editedBooking = bookingCopy
    },

    toggleEditGroupBookingModal: (state, payload) => state.showEditGroupBookingModal = payload,

    setInventoryFilters(state, payload) {
      state.inventoryFilters[payload.type] = payload.value
    },

    setSelectedExamType: (state, payload) => state.selectedExamType = payload,

    setSelectedExamTypeFilter: (state, payload) => state.selectedExamTypeFilter = payload,

    setSelectedQuickAction: (state, payload) => state.selectedQuickAction = payload,

    setSelectedQuickActionFilter: (state, payload) => state.selectedQuickActionFilter = payload,

    restoreSavedModal(state, payload) {
      Object.keys(payload.item).forEach(key => {
        Vue.set(
          state[payload.name],
          key,
          payload.item[key]
        )
      })
    },

    toggleOffsiteVisible: (state, payload) => state.offsiteVisible = payload,

    toggleExamsTrackingIP: (state, payload) => state.examsTrackingIP = payload,

    setAppointmentsStateInfo: (state, payload) => state.appointmentsStateInfo = payload,

    clearAddExamModalFromCalendarStatus: state => Vue.delete(state.addExamModal, 'fromCalendar'),

    toggleServeCitizenSpinner(state, payload) {
      state.showServeCitizenSpinner = payload
    },
    toggleInviteCitizenSpinner(state, payload) {
      state.showInviteCitizenSpinner = payload
    },

    setOffsiteOnly: (state, payload) => state.offsiteOnly = payload,

    toggleTimeTrackingIcon: (state, payload) => state.showTimeTrackingIcon = payload,
  }
})
