<template>
    <view class="rfeeds">
        <!-- feedsList 是一个二维数组 -->
        <view class="one-feeds-box" v-for="(feedsList,i) in showFeedsList" :key="i">
            <view class="one-feed" v-for="(item,j) in feedsList" :key="j"
                :class="j%6 === 0 ? (i%2===0?'feed-big-left':'feed-big-right') :''">
                <navigator :url="`/subpages/feedinfo/feedinfo?id=${item.id}`">
                    <image :src="item.cover" class="feed-content" mode="aspectFill" :lazy-load="true" />
                </navigator>
            </view>
        </view>
        <!-- 分享按钮组件 -->
        <goto-share />
    </view>
</template>

<script>
    export default {
        data() {
            return {
                // feedsShow: true,
                //动态列表数据
                feedsList: [],
                //用来展示栅格系统的列表数据
                showFeedsList: [],
            }
        },
        onLoad() {
            this.getFeeds()
        },
        onPullDownRefresh() {
            // this.feedsShow = false
            this.showFeedsList = []
            this.getFeeds()

        },
        onReachBottom() {
            this.getFeeds()
        },
        methods: {
            async getFeeds() {
                let res = await this.$u.api.getFeeds()
                let feeds = res.feeds.map(item => {
                    return {
                        id: item.id,
                        cover: this.BaseFileURL + item.images[0].file
                    }
                })
                this.feedsList = [...this.feedsList, ...feeds]
                let showArrList = []
                for (let i = 0; i < this.feedsList.length; i++) {
                    // 6张为一组
                    if (i % 6 === 0 && !!this.feedsList[i + 5]) {
                        //slice 不会改变原来的数组
                        showArrList.push(this.feedsList.slice(i, i + 6))
                    }
                }
                this.showFeedsList = showArrList
                // this.feedsShow = true
            }
        }
    }
</script>

<style lang="scss" scoped>
    .rfeeds {
        background-color: #FFFFFF;
        padding-bottom: 20upx;

        .one-feeds-box {
            width: 704upx;
            margin: 4upx 22upx 0 22upx;
            // 定义栅格布局
            display: grid;
            // 定义栅格每一列的宽度
            grid-template-columns: 232upx 232upx 232upx;
            // 定义栅格每一行的高度
            grid-template-rows: 232upx 232upx 232upx;
            // grid-row-gap属性设置行与行的间隔（行间距），grid-column-gap属性设置列与列的间隔（列间距）
            grid-row-gap: 4upx;
            grid-column-gap: 4upx;
            background-color: #DADADA;

            .one-feed {
                position: relative;

                .feed-content {
                    width: 232upx;
                    height: 232upx;
                    border: 1px solid #EEEEEE;
                    border-radius: 4upx;
                }

                .icon {
                    position: absolute;
                    right: 10upx;
                    top: 10upx;

                    .play-icon {
                        width: 40upx;
                        height: 40upx;
                    }
                }

                &.feed-big-left {
                    grid-column-start: 1;
                    grid-column-end: 3;
                    grid-row-start: 1;
                    grid-row-end: 3;
                    background-color: #DADADA;

                    .feed-content {
                        width: 466upx;
                        height: 466upx;
                        border: 1px solid #EEEEEE;
                    }
                }

                &.feed-big-right {
                    grid-column-start: 2;
                    grid-column-end: 4;
                    grid-row-start: 1;
                    grid-row-end: 3;
                    background-color: #DADADA;

                    .feed-content {
                        width: 466upx;
                        height: 466upx;
                        border: 1px solid #EEEEEE;
                    }
                }
            }
        }
    }
</style>