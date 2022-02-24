const koaRouter = require('koa-router')
const router = koaRouter()
const fs = require('fs')

const Data = require('./hrv-api/data')
const Current_data = require('./hrv-api/current_data')
const Personnel = require('./hrv-api/personnel')
const Wristband = require('./hrv-api/wristband')
const Gateway = require('./hrv-api/gateway')
const Hrv = require('./hrv-api/hrv')
const Hr = require('./hrv-api/hr')
const Exit = require('./hrv-api/exit')

router

    .get('/data/:user_id&:start_time&:end_time', Data.readData)

    .get('/5minute-hrv/:user_id&:start_time&:end_time', Hrv.read5MinuteHrv)
    .get('/latest-5minute-hrv/:user_id&:start_time&:end_time', Hrv.readLatest5MinuteHrv)
    .get('/1hour-hrv/:user_id&:start_time&:end_time', Hrv.read1HourHrv)
    .get('/1day-hrv/:user_id&:start_time&:end_time', Hrv.read1DayHrv)
    .get('/latest-1day-hrv/:user_id&:start_time&:end_time', Hrv.readLatest1DayHrv)
    .get('/latest-1week-hrv/:user_id&:start_time&:end_time', Hrv.readLatest1WeekHrv)
    .get('/latest-1month-hrv/:user_id&:start_time&:end_time', Hrv.readLatest1MonthHrv)

    .get('/5minute-hr/:user_id&:start_time&:end_time', Hr.read5MinuteHr)
    .get('/latest-1day-hr/:user_id&:start_time&:end_time', Hr.readLatest1DayHr)
    .get('/latest-1month-hr/:user_id&:start_time&:end_time', Hr.readLatest1MonthHr)

    .get('/current-data/:user_id', Current_data.readCurrentData)
    .get('/all-current-data', Current_data.readAllCurrentData)

    .post('/personnel', Personnel.createPersonnel)
    .get('/personnels', Personnel.readPersonnels)
    .get('/personnel/:user_id', Personnel.readPersonnel)
    .put('/personnel', Personnel.updatePersonnel)
    .put('/personnel-pair-mac', Personnel.updatePairedMac)
    .del('/personnel/:user_id', Personnel.deletePersonnel)

    .post('/wristband', Wristband.createWristband)
    .get('/wristbands', Wristband.readWristbands)
    .get('/wristband/:mac', Wristband.readWristband)
    .put('/wristband', Wristband.updateWristband)
    .del('/wristband/:mac', Wristband.deleteWristband)

    .post('/gateway', Gateway.createGateway)
    .get('/gateways', Gateway.readGateways)
    .get('/gateway/:gateway', Gateway.readGateway)
    .put('/gateway', Gateway.updateGateway)
    .del('/gateway/:gateway', Gateway.deleteGateway)

    .post('/exit', Exit.exit)
module.exports = exports = router
