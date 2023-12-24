<template>
    <view>
        <!-- 评论列表 -->
        <view class="comments">
            <view class="title gohere" id="gohere" ref="gohere">最新评论</view>
            <view class="no-comment" v-if="commentList.length == 0">暂无评论</view>
            <view v-for="(commentItem, index) in commentList" :key="index" class="one-comment">
                <!-- 一级评论相关 -->
                <view class="commenter">
                    <view class="info">
                        <view class="left">
                            <u-avatar size="50" class="avatar"
                                :src="!!commentItem.user.avatar ? commentItem.user.avatar.url : '' " />
                            <view class="name">{{ commentItem.user.name }}</view>
                        </view>
                    </view>
                    <view class="content">{{ commentItem.body }}</view>
                    <view class="uptime">{{ commentItem.created_at | timeFormate }} 评论</view>
                </view>
            </view>
        </view>

        <!-- 底部信息 -->
        <view class="tab-bar">
            <view class="minput" @tap="showCommentBox = true">说点什么···</view>
            <view class="mview">
                <!-- 点赞相关统计 -->
                <view class="mbtn" @tap="sendLove">
                    <image class="micon" v-if="type=='info'"
                        :src=" oneInfoClone.has_like ? '/static/lover.png' : '/static/love.png' " mode="aspectFit" />
                    <text class="mtext"
                        v-if="type=='info' && oneInfoClone.digg_count>0 ">{{ oneInfoClone.digg_count }}</text>
                    <text class="mtext" v-if="type=='info' && oneInfoClone.digg_count<=0 ">点赞</text>

                    <image class="micon" v-if="type=='feed'"
                        :src=" oneInfoClone.has_like ? '/static/lover.png' : '/static/love.png' " mode="aspectFit" />
                    <text class="mtext"
                        v-if="type=='feed' && oneInfoClone.like_count>0 ">{{ oneInfoClone.like_count }}</text>
                    <text class="mtext" v-if="type=='feed' && oneInfoClone.like_count<=0 ">点赞</text>
                </view>

                <!-- 评论相关统计 -->
                <view class="mbtn" @tap="gotoComment">
                    <image class="micon" src="/static/msg.png" mode="aspectFit" />
                    <text class="mtext"
                        v-if="type=='info' && oneInfoClone.comment_count>0 ">{{ oneInfoClone.comment_count }}</text>
                    <text class="mtext" v-if="type=='info' && oneInfoClone.comment_count<=0 ">评论</text>

                    <text class="mtext"
                        v-if="type=='feed' && oneInfoClone.feed_comment_count>0 ">{{ oneInfoClone.feed_comment_count }}</text>
                    <text class="mtext" v-if="type=='feed' && oneInfoClone.feed_comment_count<=0 ">评论</text>
                </view>

                <!-- 转发次数统计 -->
                <!-- #ifdef MP-WEIXIN -->
                <button class="mbtn mhare" open-type="share">
                    <image class="micon" src="/static/wx.png" mode="aspectFit" />
                    <text class="mtext">分享</text>
                </button>
                <!-- #endif -->

            </view>
        </view>

        <!-- 发布评论 -->
        <view class="commentBox" v-if="showCommentBox">
            <view class="header">
                <text class="title">发表评论</text>
                <u-icon class="icon" name="arrow-down-fill" color="#999" size="28" @tap="showCommentBox = false" />
            </view>
            <textarea class="texta" placeholder-style="color:#888" placeholder="想说点什么..." cursor-spacing="150"
                :focus="true" :fixed="true" :value="cinput" @input="getInput" />
            <view class="btns">
                <button class="mini-btn" type="primary" size="mini" @tap="sendComment"
                    :disabled="disableSendCommentTag">发布</button>
                <button class="mini-btn" type="default" size="mini" @tap="showCommentBox = false">取消</button>
            </view>
        </view>

        <!-- 登陆组件 -->
        <login ref="login" v-if="!loginState"></login>

    </view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
    import feedMixin from '@/mixins/todoLove.js'

    export default {

        name: "comment",
        mixins: [feedMixin],
        props: {
            oneInfo: Object,
            type: String,
            disableSendCommentTag: true,
        },
        data() {
            return {
                commentList: [],
                // props 传递的数据无法触发 DOM更新
                oneInfoClone: {},
                //
                showCommentBox: false,
                //评论输入的内容
                cinput: "",
                //是否可以发布评论

            };
        },
        computed: {
            ...mapState(["loginState"])
        },
        created() {
            this.getCommentList()
            this.oneInfoClone = this.oneInfo
        },
        methods: {
            async getCommentList() {
                let res
                const id = this.oneInfo.id
                if (this.type === "feed") {
                    res = await this.$u.api.getFeedComments({
                        id,
                    })
                } else if (this.type === "info") {
                    res = await this.$u.api.getNewComments({
                        id,
                    })
                }
                this.commentList = res.comments
            },
            // 跳转到评论列表的位置
            gotoComment() {
                const query = uni.createSelectorQuery().in(this)
                query.select("#gohere").boundingClientRect(data => {
                    this.$nextTick(() => {
                        uni.pageScrollTo({
                            duration: 0,
                            scrollTop: data.top,
                        })
                    })
                }).exec()
            },

            //获取输入的内容
            getInput($e) {
                // this.cinput = $e.detail.value.trim()
                // 如果输入有内容就能发送，否则就不能发送
                this.disableSendCommentTag = !(this.cinput = $e.detail.value.trim()) ? true : false
            },
            //实现点赞
            async sendLove() {
                // this.click
                if (!this.loginState) {
                    this.$refs.login.openLogin()
                    return
                }
                // 如果类型是feed直接调用mixin中的方法
                if (this.type === "feed") {
                    this.clickLove(this.oneInfoClone)
                } else {
                    // 动态点赞
                    if (this.oneInfoClone.has_like) {
                        --this.oneInfoClone.digg_count;
                        this.oneInfoClone.has_like = false;
                        await this.$u.api.unlikeThisNew({
                            id: this.oneInfoClone.id,
                        });
                        uni.showToast({
                            title: "取消点赞",
                            icon: "success",
                            duration: 1000,
                        });
                    } else {
                        ++this.oneInfoClone.digg_count;
                        this.oneInfoClone.has_like = true;
                        await this.$u.api.likeThisNew({
                            id: this.oneInfoClone.id,
                        });
                        uni.showToast({
                            title: "点赞成功",
                            icon: "success",
                            duration: 1000,
                        });
                    }
                }
            },
            //评论实现
            async sendComment() {
                console.log('sendComment enter')
                // 发送状态判定
                // if (this.disableSendCommentTag) return
                // this.disableSendCommentTag = true

                // // #ifdef MP-WEIXIN
                // // 敏感词信息判定
                // try {
                //     let cres = await this.doMsgSecCheck(this.cinput);
                //     if (cres.data.Response.EvilTokens.length > 0) {
                //         uni.showModal({
                //             title: '敏感词审核',
                //             content: '您发布的评论涉及敏感词：' + cres.data.Response.EvilTokens[0].EvilKeywords
                //         })
                //         return
                //     }
                // } catch (e) {
                //     console.log("敏感词审核过期，请缴费！")
                // }
                // // #endif

                if (this.type === 'feed') {
                    try {
                        await this.$u.api.commentOneFeed({
                            id: this.oneInfoClone.id,
                            body: this.cinput
                        });
                        ++this.oneInfoClone.feed_comment_count
                    } catch (e) {
                        console.log("feed comment catch: ", e)
                    }
                    // 通知 个人中心当前动态评论增加
                    // uni.$emit('myFeedCommentChange', this.oneInfoClone)
                } else {
                    //只要不是200就报错
                    try {
                        await this.$u.api.commentOneInfo({
                            id: this.oneInfoClone.id,
                            body: this.cinput
                        });
                        ++this.oneInfoClone.comment_count
                    } catch (e) {
                        console.log("info comment catch: ", e)
                    }

                }
                uni.showToast({
                    title: "评论成功",
                    icon: "success",
                    duration: 1000,
                });

                this.cinput = ''
                this.showCommentBox = false
                console.log('sendComment: ', this.showCommentBox)
                this.getCommentList()
                console.log('sendComment outer')
            }
        }
    }
</script>

<style lang="scss" scoped>
    .comments {
        padding: 20upx 20upx 200upx;

        .title {
            font-weight: bolder;
            font-size: 32upx;
            margin-bottom: 40upx;
        }

        .no-comment {
            text-align: center;
            margin: 120upx 0 280upx;
            color: #666;
        }

        .one-comment {
            &.last-comment {
                border-bottom: none;
            }

            .commenter {
                .info {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: center;
                    align-content: center;
                    margin-top: 20upx;

                    .left {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: flex-start;
                        align-items: center;
                        align-content: center;

                        .avatar {
                            margin-right: 20upx;
                            margin-top: 10upx;
                        }

                        .name {
                            font-size: 24upx;
                            font-weight: bolder;
                            color: #1f2046;
                        }
                    }
                }

                .content {
                    color: #666;
                    font-size: 30upx;
                    line-height: 50upx;
                    margin-left: 70upx;
                    margin-top: 10upx;
                    padding-right: 20upx;
                }

                .uptime {
                    color: #999;
                    font-size: 20upx;
                    margin-left: 70upx;
                    margin-top: 10upx;
                    padding-bottom: 20upx;
                    border-bottom: 1upx solid #f2f2f2;
                }
            }
        }
    }

    .tab-bar {
        position: fixed;
        width: 750upx;
        height: 120upx;
        left: 0;
        bottom: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        align-content: center;
        color: #ccc;
        border-top: 1upx solid #f6f6f6;
        background-color: #fff;

        .minput {
            background-color: #eee;
            height: 60upx;
            // #ifdef MP-WEIXIN
            width: 300upx;
            // #endif
            // #ifndef MP-WEIXIN
            width: 440upx;
            // #endif
            border-radius: 30upx;
            padding-left: 30upx;
            margin-left: 20upx;
            line-height: 60upx;
            color: #AAAAAA;
            font-size: 22upx;
        }

        .mview {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-around;
            align-items: center;
            align-content: center;
            color: #ccc;
            margin-right: 25upx;

            .mbtn {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: center;
                align-items: center;
                align-content: center;
                width: 120upx;
                background-color: #fff;

                &.mhare {
                    width: 150upx;
                }
            }

            .mbtn::after {
                border: none;
                background-color: none;
            }

            .micon {
                width: 36upx;
                height: 36upx;
            }

            .mtext {
                color: #001432;
                font-size: 24upx;
                margin-left: 10upx;
            }
        }

    }

    .commentBox {
        position: fixed;
        width: 750upx;
        height: 250px;
        left: 0;
        bottom: 0;
        border-top: 1upx solid #eee;
        background-color: #fafafa;

        .header {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            align-content: center;
            padding: 20upx 15px 20upx 25px;

            .title {
                color: #999;
                font-size: 28upx;
                font-weight: bold;
            }

            .icon {
                padding: 20upx;
            }
        }

        .texta {
            width: 600upx;
            height: 100px;
            margin-left: 50upx;
            padding: 10px 25upx;
            border: 1upx solid #ddd;
            border-radius: 10upx;
            background: #fff;
            font-size: 28upx;
        }

        .btns {
            width: 650upx;
            margin-left: 50upx;
            margin-top: 15px;
            text-align: right;

            .mini-btn {
                margin-left: 40upx;
            }
        }
    }
</style>