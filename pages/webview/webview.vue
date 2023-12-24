<template>
    <view>
        <web-view :src="url"></web-view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                url: "",
            }
        },
        methods: {

        },
        onLoad(query) {
            this.url = query.url
            console.log('this.url', this.url)
        }
    }
</script>

<style>

</style>