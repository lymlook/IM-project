<template>
  <div class="ChatSet">
    <div>websocket设置</div>
    <el-form ref="form" :model="form" id="form" label-width="150px">
      <el-form-item label="websocket地址：">
        <el-input v-model="form.ws_host"></el-input>
      </el-form-item>
      <el-form-item label="websocket端口：">
        <el-input v-model="form.ws_port"></el-input>
      </el-form-item>
      <el-form-item label="web端口：">
        <el-input v-model="form.web_port"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">确定提交</el-button>
      </el-form-item>
    </el-form>
    <!-- <form action="http://fikker1.90900000.com/public/index.php/Chat/uploadVideo" enctype="multipart/form-data" method="post">
      <input type="file" name="video" />
      <br>
      <input type="submit" value="上传" />
    </form>-->
  </div>
</template>

<script>
export default {
  name: "ChatSet",
  data() {
    return {
      fileList: [],
      form: {
        ws_host: "",
        ws_port: "",
        web_port: "",
        id: ""
      },
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      )
    };
  },
  created() {
    if (!this.admin_id || !this.token) {
      this.$router.push({ path: "/Login" });
    }
    this.loadData();
  },
  methods: {
    loadData() {
      var params = {
        admin_id: this.admin_id,
        token: this.token
      };
      var url = this.Api + "ClientManage/getWebsocket";
      this.$axios
        .get(url, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.form.ws_host = response.data.result.ws_host;
              this.form.ws_port = response.data.result.ws_port;
              this.form.web_port = response.data.result.web_port;
              this.form.id = response.data.result.id;
              break;
            case 40001: // 普通提醒状态
              this.$message({
                showClose: true,
                type: "warning",
                message: response.data.msg
              });
              break;
            case 40002: //token验证失败
              this.$message({
                showClose: true,
                type: "warning",
                message: response.data.msg
              });
              setTimeout(() => {
                  this.$router.push({ path: "/login" });
                }, 1500);
              break;
            case 40003: //未登录状态
              this.$message({
                showClose: true,
                type: "warning",
                message: response.data.msg
              });
              setTimeout(() => {
                  this.$router.push({ path: "/login" });
                }, 1500);
              break;
            case 405: //没有权限
              this.$message({
                showClose: true,
                type: "warning",
                message: response.data.msg
              });
              break;
            case 302: //唯一登录
              this.$message({
                showClose: true,
                type: "warning",
                message: response.data.msg
              });
              setTimeout(() => {
                  this.$router.push({ path: "/login" });
                }, 1500);
              break;
          }
        })
        // 请求error
        .catch(
          function(error) {
            this.$notify.error({
              title: "错误",
              message: "错误：请检查网络"
            });
            //this.$router.push({path: '/Login'})
          }.bind(this)
        );
    },
    onSubmit() {
      this.$confirm("确定提交吗？", "提示", {}).then(() => {
        var params = {
          admin_id: this.admin_id,
          token: this.token,
          ws_host: this.form.ws_host,
          ws_port: this.form.ws_port,
          web_port: this.form.web_port,
          id: this.form.id
        };
        var url = this.Api + "ClientManage/setWebsocket";
        this.$axios
          .post(url, this.$qs.stringify(params))
          .then(response => {
            switch (response.data.code) {
              case 200:
                this.loadData();
                this.$message({
                  showClose: true,
                  type: "success",
                  message: response.data.msg
                });
                break;
              case 40001: // 普通提醒状态
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                break;
              case 40002: //token验证失败
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                setTimeout(() => {
                  this.$router.push({ path: "/login" });
                }, 1500);
                break;
              case 40003: //未登录状态
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                setTimeout(() => {
                  this.$router.push({ path: "/login" });
                }, 1500);
                break;
              case 405: //没有权限
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                break;
              case 302: //唯一登录
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                setTimeout(() => {
                  this.$router.push({ path: "/login" });
                }, 1500);
                break;
            }
          })
          // 请求error
          .catch(
            function(error) {
              this.$notify.error({
                title: "错误",
                message: "错误：请检查网络"
              });
              // this.$router.push({path: '/Login'})
            }.bind(this)
          );
      });
    }
  }
};
</script>
<style scoped>
#form {
  margin: auto;
  width: 40%;
}
</style>