let todoLoveMixin = {
    methods: {
        //点赞或者取消点赞
        async clickLove(item) {
            console.log('item', item)
            // 判断是否处于登录状态
            // 这个this是引入上下文的this
            if (!this.loginState) {
                this.$refs.login.openLogin()
                return
            }
            // 动态点赞
            if (item.has_like) {
                --item.like_count;
                // console.log(item.has_like)
                item.has_like = false;
                try {
                    await this.$u.api.unlikeThisFeed({
                        id: item.id,
                    });
                } catch (e) {
                    console.log(e)
                } finally {
                    uni.showToast({
                        title: "取消点赞成功",
                        icon: "success",
                        duration: 1000,
                    });
                }

            } else {
                ++item.like_count;
                item.has_like = true;
                try {
                    await this.$u.api.likeThisFeed({
                        id: item.id,
                    });
                } catch (e) {
                    console.log(e)
                } finally {
                    uni.showToast({
                        title: "点赞成功",
                        icon: "success",
                        duration: 1000,
                    });
                }
            }
            //触发点赞量和点赞数更新
            uni.$emit('indexFeedLoveChange', item)
            uni.$emit('myFeedLoveChange', item)
        }
    }
}

export default todoLoveMixin