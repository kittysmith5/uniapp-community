<template>
    <view v-if="getReqOK">
        <!-- 顶部导航 -->
        <uni-nav-bar
            backState="2000"
            fontColor="#FFF"
            :titleCenter="false"
            type="transparent"
        >
            <view slot="left">
                <image
                    class="hicon"
                    src="/static/home.png"
                    mode="aspectFit"
                    @tap="goHome"
                />
            </view>
        </uni-nav-bar>
        <uni-nav-bar
            v-if="navBarShow"
            backState="1000"
            :titleCenter="false"
        >{{ newInfo.cutTitle }}</uni-nav-bar>

        <pic-blur :params="{
		        width:'750rpx',
		        height:'520rpx',
		        image: newInfo.cover,
		        blur:'xs'
		    }"></pic-blur>

        <view class="model">
            <!-- 标题 -->
            <view class="mtitle">{{newInfo.title}}</view>
            <view class="info-user">
                <view class="info">
                    <text>{{ newInfo.author }} {{ newInfo.views_count }}阅读</text>
                </view>
            </view>
        </view>

        <!-- 资讯详情 -->
        <view class="info-content">
            <html-parse :content="newInfo.content" />
        </view>

        <!-- 作者信息 -->
        <view class="info-header">
            <text class="send">{{ newInfo.created_at | timeFormate}}发布 </text>
            <text>{{ newInfo.views_count }}阅读</text>
        </view>

        <view class="line" />
        <comment
            :oneInfo="newInfo"
            type="info"
        />
    </view>
</template>

<script>
    import htmlParse from "@/components/html-parse/parse.vue"
    import picBlur from "@/components/pic-blur/pic-blur.vue"
    import comment from "@/components/comment/comment.vue"
    export default {
        components: {
            picBlur,
            htmlParse,
            comment,
        },
        data() {
            return {
                newInfo: {},
                navBarShow: false,
                getReqOK: false,
            }
        },
        onPageScroll($event) {
            this.navBarShow = $event.scrollTop >= 100 ? true : false
        },
        async onLoad(options) {
            const res = await this.$u.api.getNewInfo(options)

            // 使用正则表达式  有几个组就替换几次
            let content = res.content.replace(/@!\[.*?\]\((\d*)\)/g, "<img src='" + this.BaseFileURL + '$1' + "'/>")
            content = content.replace(/\s\D\s/g, "<p></p>")
            this.newInfo = {
                ...res,
                cutTitle: res.title.length > 15 ? res.title.substring(0, 15) + "..." : res.title,
                cover: this.BaseFileURL + res.image.id,
                userId: res.user_id,
                content,
                views_count: res.hits
            }
            this.getReqOK = true
        },
        methods: {
            goHome() {
                uni.switchTab({
                    url: "/pages/index/index",
                })
            },
        }
    }
</script>

<style
    lang="scss"
    scoped
>
    // /* 引入富文本解析器 */
    @import '@/components/html-parse/parse.css';

    .hicon {
        height: 36upx;
        width: 36upx;
        padding-left: 30upx;
        padding-top: 10upx;
    }

    .model {
        width: 750upx;
        height: 520upx;
        position: absolute;
        background-color: rgba($color: #364161, $alpha: 0.2);
        z-index: 1;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-end;

        .mtitle {
            margin-top: 20upx;
            width: 700upx;
            margin-left: 25upx;
            font-size: 44upx;
            color: #fff;
            line-height: 64upx;
        }

        .info-user {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: center;
            align-content: center;
            margin-top: 30upx;
            margin-left: 5upx;
            margin-bottom: 30upx;

            .info {
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                justify-content: flex-end;
                align-items: left;
                margin-left: 20upx;
                font-size: 24upx;
                font-weight: bolder;
                color: #fff;
            }
        }
    }

    .info-content {
        width: 680upx;
        text-align: left;
        margin-top: 40upx;
        // #ifdef MP-WEIXIN
        margin-left: 35upx;
        // #endif
        // #ifndef MP-WEIXIN
        margin-left: 0;
        // #endif
    }

    .info-header {
        margin-top: 10upx;
        margin-left: 25upx;
        padding-bottom: 20upx;
        color: #999;
        font-size: 22upx;

        .send {
            margin-right: 20upx;
        }
    }

    .line {
        height: 30upx;
        width: 750upx;
        background-color: #f3f3f3;
    }
</style>