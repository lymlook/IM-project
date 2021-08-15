<template>
  <div class="UserLog">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="设备类型">
        <el-select v-model="formInline.device_type" clearable placeholder="请选择">
          <el-option
            v-for="item in types"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户账号">
        <el-input v-model="formInline.u_login_id" clearable placeholder="输入用户账号"></el-input>
      </el-form-item>
      <el-form-item label="动作">
        <el-select v-model="formInline.acotion" clearable placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <template>
      <el-button id="add" type="danger" @click="handleDelete()">批量删除</el-button>
      <el-table
        :data="tableData"
        height="678"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="id" label="ID" width="55" sortable></el-table-column>

        <el-table-column prop="user.u_login_id" label="用户账号" width="180"></el-table-column>

        <el-table-column prop="device_type" label="设备">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.device_type == 1">IOS</el-tag>
            <el-tag type="success" v-if="scope.row.device_type == 2">Android</el-tag>
            <el-tag type="info" v-if="scope.row.device_type == 3">H5</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="acotion" label="动作">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.acotion == 1">登入</el-tag>
            <el-tag type="warning" v-if="scope.row.acotion == 2">退出</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="user.ip.ip" label="IP"></el-table-column>

        <el-table-column prop="create_time" label="日期时间"></el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="handleDelete(scope.row.id, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 50, 100, 200]"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </template>
  </div>
</template>

<script>
export default {
  name: "UserLog",
  data() {
    return {
      tableData: [],
      total: 0,
      multipleSelection: [],
      formInline: {
        device_type: "", // 设备类型
        u_login_id: "", // 用户账号
        acotion: "" // 动作
      },
      options: [
        {
          value: "1",
          label: "登录"
        },
        {
          value: "2",
          label: "退出"
        }
      ],
      types: [
        {
          value: "1",
          label: "IOS"
        },
        {
          value: "2",
          label: "Android"
        },
        {
          value: "3",
          label: "H5"
        }
      ],
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      ),
    };
  },
  methods: {
    loadData() {
      var params = {
        admin_id: this.admin_id,
        token: this.token,
      };
      var url = this.Api + "UserLog/getUserLog";
      this.axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.total = response.data.total;
              this.tableData = response.data.data;
              break;
            case 40001:
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
          // console.log(response.data)
        })
        .catch(error => {
          console.log(error);
        });
    },
    handleSelectionChange(val) {
      this.multipleSelection = [];
      for (var item in val) {
        this.multipleSelection.push(val[item].id);
      }

      console.log(this.multipleSelection);
    },
    handleDelete(index, row) {
      this.$confirm("确定删除吗？", "提示", {}).then(() => {
        var param = {
          id: !index ? this.multipleSelection : index,
          admin_id: this.admin_id,
          token: this.token
        };

        var url = this.Api + "UserLog/deleteUserLog";
        this.$axios
          .post(url, this.$qs.stringify(param))
          .then(response => {
            switch (response.data.code) {
              case 200:
                this.loadData();
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
            }.bind(this)
          );
      });

      console.log(index, row);
    },
    // 搜索
    onSearch() {
        if(this.formInline.device_type == '' && this.formInline.u_login_id == '' && this.formInline.acotion == ''){
        this.$message({
                showClose: true,
                type: "warning",
                message: '参数不能为空'
              });
              return ;
      }
      console.log("查询", this.formInline);
      var url = this.Api + "UserLog/searchUserLog";
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        device_type: this.formInline.device_type,
        u_login_id: this.formInline.u_login_id,
        acotion: this.formInline.acotion
      };
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.total = response.data.total;
              this.tableData = response.data.data;
              break;
            case 40001:
              this.tableData = [];
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
        .catch(error => {
          console.log(error);
        });
    },
    handleSizeChange(val) {
      this.pagesize = val;
      //console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      //console.log(`当前页: ${val}`);
      var offset = this.currentPage * this.pagesize - this.pagesize;
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        offset: offset,
        length: this.pagesize,
        device_type: this.formInline.device_type,
        u_login_id: this.formInline.u_login_id,
        acotion: this.formInline.acotion
      };
      if (params.device_type != "" || params.u_login_id != "" || params.acotion != "") {
        var adminUrl = this.Api + "UserLog/searchUserLog"; // 搜索条件为空，走搜索接口
      } else {
        var adminUrl = this.Api + "UserLog/getUserLog"; // 获取用户列表
      }

      this.$axios
        .post(adminUrl, this.$qs.stringify(params))
        .then(response => {
          this.tableData = response.data.data;
          console.log(this.tableData);
        })
        .catch(error => {
          console.log(error);
        });
    },
    get_ip(ip) {
      var url = "" + ip;
      this.$axios
        .get(url)
        .then(response => {
          console.log(response);
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
    }
  },
  created: function() {
    if (!this.admin_id || !this.token) {
      this.$router.push({ path: "/Login" });
    }
    this.loadData();
  }
};
</script>

<style scoped>
#add {
  float: left;
}
</style>
