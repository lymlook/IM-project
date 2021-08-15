<script>
const APP_SERVER_URL = {
    host: "http://www.chat.com",
    postfix: "/public/index.php/"
};

// -----------------打包用

// const APP_SERVER_URL = {
//     host: window.location.origin,
//     postfix: "/public/index.php/"
// };



const serverUrl =  APP_SERVER_URL.host + APP_SERVER_URL.postfix; // API接口前缀
    export default {
        serverUrl
    }
</script>

<style scoped>

</style>
