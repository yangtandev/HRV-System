const { Time } = require('@avihimsa/heart-rate-variability-analysis')
const formulas = {
    AGE: (user_birthday) => {
        let age = 40
        if (user_birthday) {
            const current = new Date()
            const birthday = new Date(parseInt(user_birthday, 10))
            age = current.getFullYear() - birthday.getFullYear()
            const month_difference = current.getMonth() - birthday.getMonth()
            if (month_difference < 0 || (month_difference === 0 && current.getDate() < birthday.getDate())) {
                age--
            }
        }
        return age
    },
    MEAN_HR: (all_hr) => all_hr.reduce((a, b) => a + b) / all_hr.length,
    MAX_HR: (all_hr) => all_hr.reduce((a, b) => Math.max(a, b)),
    MIN_HR: (all_hr) => all_hr.reduce((a, b) => Math.min(a, b)),
    SDNN: (all_rri) => {
        const sdnn = Time.SDNN(all_rri)
        return sdnn > 0 ? sdnn : 0
    },
    RMSSD: (all_rri) => {
        const rmssd = Time.RMSSD(all_rri)
        return rmssd > 0 ? rmssd : 0
    },
    HRR: (age, current_hr, current_max_hr) => {
        // 最大心率估計方式採用Jackson et al. (2007)提出對年齡校正之預估公式HRmax= 206.9 - (0.67＊Age)。
        let estimate_max_hr = 206.9 - 0.67 * age
        // 如果實際數據高(低)於預估數據，則採用實際數據。
        let max_hr = current_max_hr > estimate_max_hr ? current_max_hr : estimate_max_hr
        // 根據美國心臟協會統計: 常人靜止心率約為 60，而專業運動員則可低至 40。
        let rest_hr = current_hr < 40 ? current_hr : 40
        // 最大心率與最小心率差值即為心率儲備(HRR, Heart Rate Reserve)。
        let hrr = max_hr - rest_hr
        // %HRR為HRR的量化指標，%HRR = (HRex – HRrest)/(HRmax – HRrest)。
        let percent_hrr = ((current_hr - rest_hr) / hrr) * 100
        return percent_hrr > 0 ? percent_hrr : 0
    },
    FFT: (all_rri) => {
        const { fft, util } = require('fft-js')
        const rri_mean = all_rri.reduce((a, b) => a + b) / all_rri.length
        const all_frequency = all_rri.map((rri) => rri - rri_mean)
        const all_frequency_length = all_frequency.length
        const get_size = (power) => Math.pow(2, power)
        let power = 1
        while (get_size(power) < all_frequency_length) {
            power++
        }
        const bufferSize = get_size(power)
        const buffer = all_frequency.concat(new Array(bufferSize - all_frequency_length).fill(0))
        const phasors = fft(buffer)
        const sample_rate = 1000
        const frequencies = util.fftFreq(phasors, sample_rate)
        const magnitudes = util.fftMag(phasors)
        const ms_to_s = (ms) => ms / 1000
        const points = frequencies.map(function (f, ix) {
            return { x: ms_to_s(f), y: magnitudes[ix] / (bufferSize / 2) }
        })
        // let TF = []
        let HF = []
        let LF = []
        // let VLF = []

        for (let point of points) {
            // TF.push(point.y)
            if (point.x >= 0.15 && point.x <= 0.4) HF.push(point.y)
            else if (point.x >= 0.04 && point.x < 0.15) LF.push(point.y)
            // else if (point.x < 0.04) VLF.push(point.y)
        }

        // TF = TF.length > 1 ? TF.reduce((a, b) => a + b) : TF[0]
        HF = HF.length > 1 ? HF.reduce((a, b) => a + b) : HF[0]
        LF = LF.length > 1 ? LF.reduce((a, b) => a + b) : LF[0]
        // VLF = VLF.length > 1 ? VLF.reduce((a, b) => a + b) : VLF[0]

        // const nHF = (HF / (TF - VLF)) * 100
        // const nLF = (LF / (TF - VLF)) * 100
        // const frequency = nLF / nHF
        const frequency = LF / HF

        return frequency > 0 ? frequency : 0
    },
    OUTLIER: (mean, sd, sd_scale) => {
        const Q1 = mean - sd * 0.675
        const Q3 = mean + sd * 0.675
        const IQR = Q3 - Q1
        const scale = (sd_scale - 0.675) / 1.35
        const outlier = Math.round((Q1 - scale * IQR) * 100) / 100
        return outlier
    },
}

module.exports = formulas
