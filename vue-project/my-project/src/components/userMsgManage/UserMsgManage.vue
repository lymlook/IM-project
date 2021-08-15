<template>
  <div class="UserMsgManage">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="类型">
        <el-select v-model="formInline.type" clearable placeholder="请选择">
          <el-option
            v-for="item in types"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发送者">
        <el-input v-model="formInline.from_user" clearable placeholder="输入用户账号"></el-input>
      </el-form-item>
      <el-form-item label="接收者">
        <el-input v-model="formInline.to_user" clearable placeholder="输入用户账号"></el-input>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="formInline.state" clearable placeholder="请选择">
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
      <el-button id="del" type="danger" @click="delMsg()">批量删除</el-button>

      <el-table
      v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        border
        height="678"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="m_id" label="ID" sortable width="120"></el-table-column>
        <el-table-column prop="m_type" label="类型" width="120"></el-table-column>
        <el-table-column prop="m_post_messages" show-overflow-tooltip="true" label="内容"></el-table-column>
        <el-table-column prop="m_from_user_id" label="发送者" width="120" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.m_from_user_id.u_login_id }}</template>
        </el-table-column>
        <el-table-column prop="m_to_user_id" label="接收者" width="120" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.m_to_user_id.u_login_id }}</template>
        </el-table-column>
        <el-table-column prop="state" label="状态" width="120">
          <template
            slot-scope="scope"
          >{{ scope.row.state==1?'用户撤回':scope.row.state==2?'群主删除':'正常' }}</template>
        </el-table-column>
        <el-table-column prop="create_time" label="发送时间" sortable width="180"></el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="delMsg(scope.row.m_id, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @size-change="SizeChange"
        @current-change="CurrentChange"
        :current-page="Page"
        :page-sizes="[10, 50, 100, 200]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </template>
  </div>
</template>
<script>
export default {
  name: "UserMsgManage",
  data() {
    return {
      radio: "",
      tableData: [],
      total: 0,
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      ),

      multipleSelection: [],
      formInline: {
        type: "", // 类型
        from_user: "", // 发送者
        to_user: "", // 接收者
        state: "" // 状态
      },
      options: [
        {
          value: "1",
          label: "用户撤回"
        },
        {
          value: "0",
          label: "正常"
        }
      ],
      Page: 1, //初始页
      size: 10, //    每页的数据
      ug_id: "",
      types: [
        {
          value: "text",
          label: "text"
        },
        {
          value: "video",
          label: "video"
        },
        {
          value: "image",
          label: "image"
        },
        {
          value: "notice",
          label: "notice"
        },
        {
          value: "audio",
          label: "audio"
        }
      ],
      loading: true
    };
  },
  created() {
    this.localData();
  },
  methods: {
    localData() {
      var params = {
        admin_id: this.admin_id,
        token: this.token,
      };
      var adminUrl = this.Api + "UserMsgManage/getUserMsgList"; // 获取平台用户消息列表
      this.$axios
        .post(adminUrl, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.total = response.data.total;
              this.tableData = response.data.userMsgList;
              this.loading = false;
              break;
            case 40001: // 普通提醒状态
              this.$message({
                showClose: true,
                type: "warning",
                message: response.data.msg
              });
              this.loading = false;
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
          console.log(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    },
    SizeChange(val) {
      this.size = val;
      console.log(`每页 ${val} 条`);
    },
    CurrentChange(val) {
      this.Page = val;
      //console.log(`当前页: ${val}`);
      var offset = this.Page * this.size - this.size;
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        offset: offset, 
        length: this.size,
        type: this.formInline.type,
        from_user: this.formInline.from_user,
        to_user: this.formInline.to_user,
        state: this.formInline.state,
      };
      if(params.type != '' || params.from_user != '' || params.to_user != '' || params.state != ''){
        var url = this.Api + "UserMsgManage/searchUserMsg";
      }else{
        var url = this.Api + "UserMsgManage/getUserMsgList";
      }
      
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          this.tableData = response.data.userMsgList;

          console.log(this.tableData);
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 多选框值
    handleSelectionChange(val) {
      this.multipleSelection = [];
      for (var item in val) {
        this.multipleSelection.push(val[item].m_id);
      }
    },
    // 删除
    delMsg(m_id) {
      if (m_id) {
        this.multipleSelection = [];
        this.multipleSelection.push(m_id);
      }

      this.$confirm("确定要删除群消息吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var url = this.Api + "UserMsgManage/delUserMsg";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            m_ids: this.multipleSelection
          };
          this.$axios
            .post(url, this.$qs.stringify(params))
            .then(response => {
              switch (response.data.code) {
                case 200:
                  this.$message({
                    type: "success",
                    message: response.data.msg
                  });
                  // 成功后重新加载
                  this.localData();
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
            .catch(error => {
              console.log(error);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 搜索
    onSearch() {
      if(this.formInline.type == '' && this.formInline.from_user == '' && this.formInline.to_user == '' && this.formInline.state == ''){
        this.$message({
                showClose: true,
                type: "warning",
                message: '参数不能为空'
              });
              return ;
      }
      this.loading = true;
      console.log("查询", this.formInline);
      var url = this.Api + "UserMsgManage/searchUserMsg";
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        type: this.formInline.type,
        from_user: this.formInline.from_user,
        to_user: this.formInline.to_user,
        state: this.formInline.state,
      };
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.tableData = [];
              this.total = response.data.total;
              this.tableData = response.data.userMsgList;
              this.loading = false;
              break;
            case 40001:
              this.tableData = [];
              this.$message({
                type: "error",
                message: response.data.msg
              });
              this.loading = false;
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
              this.loading = false;
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
    }
  }
};
</script>
<style lang="css">
.el-tooltip__popper{
  font-size: 14px;
  max-width:50% 
} /*设置显示隐藏部分内容，按50%显示*/
</style>
<style scoped>
#del {
  float: left;
}
</style>