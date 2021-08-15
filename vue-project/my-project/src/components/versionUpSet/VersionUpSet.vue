<template>
  <div class="ChatSet">
    <div>客户端版本信息设置</div>
    <el-form ref="form" :model="form" id="form" label-width="160px">
      <el-form-item label="提示信息：">
        <el-input v-model="form.note"></el-input>
      </el-form-item>
      <el-form-item label="版本号：">
        <el-input v-model="form.version"></el-input>
      </el-form-item>
      <el-form-item label="iOS平台下载地址：">
        <el-input v-model="form.ios"></el-input>
      </el-form-item>
      <el-form-item label="Android平台下载地址：">
        <el-input v-model="form.android"></el-input>
      </el-form-item>
      <el-form-item label="是否强制更新：">
        <template>
          <el-radio v-model="form.code" :label="0">否</el-radio>
          <el-radio v-model="form.code" :label="1">是</el-radio>
        </template>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">确定提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "ChatSet",
  data() {
    return {
      form: {
        code: "",
        note: "",
        version: "",
        ios: "",
        android: "",
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
      var url = this.Api + "versionUpSet/getVersionInfo";
      this.$axios
        .get(url, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.form.code = response.data.data.code;
              this.form.note = response.data.data.note;
              this.form.version = response.data.data.version;
              this.form.ios = response.data.data.ios;
              this.form.android = response.data.data.android;
              this.form.id = response.data.data.id;
              break;
            case 40001:
              this.$message({
                type: "error",
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
          }.bind(this)
        );
    },
    onSubmit() {
      this.$confirm("确定提交吗？", "提示", {}).then(() => {
        var params = {
          admin_id: this.admin_id,
          token: this.token,
          code: this.form.code,
          note: this.form.note,
          version: this.form.version,
          ios: this.form.ios,
          android: this.form.android,
          id: this.form.id
        };
        var url = this.Api + "versionUpSet/setVersionInfo";
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
              case 40001:
                this.$message({
                  type: "error",
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
              console.log(error);
              this.$notify.error({
                title: "错误",
                message: "错误：请检查网络"
              });
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