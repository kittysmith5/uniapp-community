import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        loginState: uni.getStorageSync("loginState") === "ok" ? true : false,
        userInfo: !!uni.getStorageSync("userInfo") ? JSON.parse(uni.getStorageSync("userInfo")) : {
            name: '未知用户',
            avatar: '/static/nopic.png',
            liked: 0,
            commented: 0
        }
    },
    getters: {

    },
    mutations: {
        userLogin(state, userInfo) {
            state.loginState = true
            state.userInfo = userInfo
            uni.setStorageSync("loginState", "ok")
            uni.setStorageSync("userInfo", JSON.stringify(userInfo))
        },
        userLogout(state) {
            state.loginState = false
            // uni.setStorageSync("loginState", "no")
            state.userInfo = {
                name: '未知用户',
                avatar: '/static/nopic.png',
                liked: 0,
                commented: 0
            }
            uni.clearStorageSync()
        }
    },
    actions: {
        userLoginAction(ctx, userInfo) {
            ctx.commit('userLogin', userInfo)

        },
        userLogoutAction(ctx) {
            ctx.commit('userLogout')
        }
    }
})

export default store