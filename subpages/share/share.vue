<template>
    <view class="share">
        <!-- 内容输入框 -->
        <view class="uni-textarea">
            <textarea
                placeholder-style="color:#AAAAAA"
                placeholder="添加描述..."
                @input="bindTextAreaInput"
            />
        </view>

        <!-- 内容发布 -->
        <view class="pics">
            <view
                class="medias"
                v-for="( image, index ) in uploadPicsList"
                :key="index"
            >
                <image
                    class="img"
                    :src="image.path"
                    :data-src="image"
                    @tap="previewImage(index)"
                    mode="aspectFill"
                />
                <u-icon
                    name="close"
                    class="iclose"
                    color="#eee"
                    size="20"
                    @tap="removeImage(index)"
                />
            </view>

            <!-- 选择照片按钮 -->
            <view
                class="uploadBtn"
                @tap="chosePicsAndUpload"
                v-if="uploadPicsList.length < 9"
            >
                <u-icon
                    name="plus"
                    size="60"
                    color="#aaa"
                />
                <view class="text">选择照片</view>
            </view>

        </view>

        <view class="btns">
            <u-button
                type="primary"
                size="default"
                @click="sendFeed"
                :disabled="uploadStatus"
            >发布动态</u-button>
        </view>

    </view>
</template>

<script>
    export default {
        data() {
            return {
                //发布内容的描述;
                feedInfo: "",
                // 预制图片上传列表
                uploadPicsList: []


            }
        },
        methods: {
            // 获取输入的内容
            bindTextAreaInput($e) {
                this.feedInfo = $e.detail.value
            },
            chosePicsAndUpload() {
                let count = 9 - this.uploadPicsList.length
                if (this.uploadPicsList.length >= 9) {
                    uni.showToast({
                        title: "最多选择9张照片",
                        icon: "success",
                        duration: 1000,
                    });
                    count = 0;
                    return false;
                }
                uni.chooseImage({
                    count,
                    sizeType: ["compressed"],
                    sourceType: ["album", "camera"],
                    success: res => {
                        this.uploadPicsList = [...this.uploadPicsList, ...res.tempFiles]
                        if (this.uploadPicsList.length > 9) {
                            this.uploadPicsList = this.uploadPicsList.slice(0, 9)
                        }
                    }
                })
            },
            removeImage(index) {
                this.uploadPicsList.splice(index, 1)

            },
            previewImage(index) {
                const current = this.uploadPicsList[index].path;
                const urls = []
                this.uploadPicsList.map((item) => {
                    urls.push(item.path);
                });
                uni.previewImage({
                    current: current,
                    urls,
                });
            },
            async sendFeed() {
                if (this.feedInfo === "") {
                    uni.showToast({
                        title: "描述不能为空",
                        icon: "loading",
                        duration: 1000,
                    })
                    this.uploadStatus = false
                    return
                }
                if (this.uploadPicsList.length <= 0) {
                    uni.showToast({
                        title: "请选择照片",
                        icon: "loading",
                        duration: 1000,
                    })
                    this.uploadStatus = false
                    return
                }
                uni.showToast({
                    title: "动态发布中...",
                    icon: "loading",
                    duration: 2000,
                });

                const upStatusArr = []
                this.uploadPicsList.map(file => {
                    upStatusArr.push(this.$u.api.uploadFile(file));
                });
                // console.log('upStatusArr', upStatusArr)
                const images = [];
                (await Promise.all(upStatusArr)).map((item) => {
                    images.push({
                        id: item.id
                    });
                });
                // console.log('all', all)
                let pres
                try {
                    pres = await this.$u.api.postOneFeed({
                        feed_content: this.feedInfo,
                        feed_from: 5,
                        feed_mark: new Date().getTime(),
                        images
                    });
                } catch (e) {
                    pres = e
                    console.log('e', e)
                }

                console.log('pres', pres)
                console.log('pres.data.message', pres.data.message)
                console.log('!!pres.data', !!pres.data)
                if (!!pres.data && pres.data.message === "发布成功") {
                    uni.hideToast();
                    uni.showToast({
                        title: "动态发布成功",
                        icon: "success",
                        duration: 1000,
                        success: () => {
                            // 通知个人中心 动态更新了
                            uni.$emit("myFeedsUpdate")
                            // 通知首页 动态更新了
                            uni.$emit("indexUserLogin");
                            this.uploadStatus = false;
                            uni.navigateBack({
                                delta: 1,
                            });
                        },
                    });
                } else {
                    uni.hideToast();
                    uni.showModal({
                        title: "动态发布失败",
                        content: pres.data.message,
                        complete: () => {
                            uni.navigateBack({
                                delta: 1,
                            });
                        }
                    });
                    this.uploadStatus = false;
                }

            }

        }
    }
</script>

<style
    lang="scss"
    scoped
>
    .share {
        width: 750upx;
        margin-top: 20upx;
        margin-bottom: 200upx;
    }

    .uni-textarea {
        margin: 20upx 50upx;
        padding: 20upx;
        border-radius: 10upx;
        border: 1upx solid #ccc;
    }

    .pics {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: center;
        align-content: center;
        padding-top: 20upx;
        padding-bottom: 20upx;
        padding-left: 46upx;

        .medias {
            width: 210upx;
            height: 210upx;
            background-color: #eee;
            border-radius: 6upx;
            margin: 5upx;
            position: relative;

            .iclose {
                position: absolute;
                right: 0;
                top: 0;
                background-color: rgba($color: #333, $alpha: 0.6);
                border-bottom-left-radius: 100%;
                padding: 10upx 10upx 16upx 16upx;
                z-index: 999;
            }
        }

        .img {
            width: 210upx;
            height: 210upx;
            border-radius: 6upx;
        }

        .video {
            width: 210upx;
            height: 210upx;
            border-radius: 6upx;
        }

        .uploadBtn {
            width: 210upx;
            height: 210upx;
            background-color: #eee;
            border-radius: 6upx;
            margin: 5upx;
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            align-content: center;

            .text {
                color: #888;
                font-size: 24upx;
                margin-top: 20upx;
            }
        }
    }

    .btns {
        width: 700upx;
        position: fixed;
        bottom: 40upx;
        left: 25upx;
    }
</style>