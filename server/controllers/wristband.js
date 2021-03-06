const { Wristband, Personnel } = require('../models/models')

const api = {
    // 新增單一新手環
    createWristband: async (ctx) => {
        const data = ctx.request.body
        try {
            const params = {
                mac: data.mac.toLowerCase(),
                pair_type: data.pair_type.toUpperCase(),
            }
            let result = await Wristband.create(params, { raw: true })
            ctx.response.body = result
        } catch (error) {
            ctx.response.body = error
        }
    },

    // 取得手環列表
    readWristbands: async (ctx) => {
        try {
            let result = await Wristband.findAll({ raw: true })
            ctx.response.body = result
        } catch (error) {
            ctx.response.body = error
        }
    },

    // 取得單一手環
    readWristband: async (ctx) => {
        let mac = ctx.params.mac
        try {
            let result = await Wristband.findOne({ where: { mac: mac }, raw: true })
            ctx.response.body = result
        } catch (error) {
            ctx.response.body = error
        }
    },

    // 更新手環型號及欲配對的使用者
    updateWristband: async (ctx) => {
        const data = ctx.request.body
        try {
            await Wristband.update(
                {
                    user_id: null,
                },
                {
                    where: {
                        user_id: data.user_id,
                    },
                    raw: true,
                }
            )
            await Wristband.update(
                {
                    user_id: data.user_id,
                    pair_type: data.pair_type,
                },
                {
                    where: {
                        mac: data.mac,
                    },
                    raw: true,
                }
            )
            await Personnel.update(
                {
                    mac: null,
                },
                {
                    where: {
                        mac: data.mac,
                    },
                    raw: true,
                }
            )
            await Personnel.update(
                {
                    mac: data.mac,
                },
                {
                    where: {
                        user_id: data.user_id,
                    },
                    raw: true,
                }
            )

            ctx.response.body = '手環已成功更新'
        } catch (error) {
            ctx.response.body = error
        }
    },

    // 刪除單一手環，並同步使用者列表
    deleteWristband: async (ctx) => {
        let mac = ctx.params.mac
        try {
            await Personnel.update({ mac: null }, { where: { mac: mac }, raw: true })
            await Wristband.destroy({
                where: {
                    mac: mac,
                },
                raw: true,
            })
            ctx.response.body = `已刪除手環 ${mac} .`
        } catch (error) {
            ctx.response.body = error
        }
    },
}

module.exports = api
