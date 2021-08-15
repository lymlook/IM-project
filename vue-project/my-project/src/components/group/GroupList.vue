<template>
  <div class="grouplist">
    <template>
      <el-table
        :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
        border
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        style="width: 100%"
        height="750"
      >
        <el-table-column prop="ug_id" sortable label="ID" width="80"></el-table-column>
        <el-table-column label="头像" width="80">
          <template scope="scope">
            <img :src="scope.row.ug_icon" width="40" height="40" class="head_pic" />
          </template>
        </el-table-column>
        <el-table-column prop="ug_name" label="群名称"></el-table-column>
        <el-table-column prop="group_user_count" label="群成员数量"></el-table-column>
        <el-table-column label="群主账号">
          <template slot-scope="scope">{{scope.row.group_admin.u_login_id}}</template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="dissolveGroup(scope.row.ug_id)">解散</el-button>
            <el-button size="mini" type="primary" @click="groupMessage(scope.row.ug_id)">群消息管理</el-button>
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
        :total="tableData.length"
      ></el-pagination>
    </template>

    <template>
      <el-dialog title="群消息管理" :visible.sync="outerVisible" width="90%" top="8vh">
        <el-button id="del" type="danger" @click="delMsg()">批量删除</el-button>
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
            <el-input v-model="formInline.u_login_id" clearable placeholder="输入用户账号"></el-input>
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
        <el-table
          ref="multipleTable"
          :data="groupMsgList"
          tooltip-effect="dark"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          style="width: 100%"
          border
          height="605"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="gm_id" label="ID" sortable width="120"></el-table-column>
          <el-table-column prop="ug_type" label="类型" width="120"></el-table-column>
          <el-table-column prop="gm_content" show-overflow-tooltip="true" label="内容"></el-table-column>
          <el-table-column prop="msg_user" label="发送者" width="120" show-overflow-tooltip>
            <template slot-scope="scope">{{ scope.row.msg_user.u_login_id }}</template>
          </el-table-column>
          <el-table-column prop="state" label="状态" width="120">
            <template
              slot-scope="scope"
            >{{ scope.row.state==1?'用户撤回':scope.row.state==2?'群主删除':'正常' }}</template>
          </el-table-column>
          <el-table-column prop="create_time" label="发送时间" sortable width="180"></el-table-column>
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="delMsg(scope.row.gm_id, scope.row)">删除</el-button>
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
      </el-dialog>
    </template>
  </div>
</template>

<script>
export default {
  name: "GroupList",
  data() {
    return {
      radio: "",
      tableData: [],
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      ),
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据
      outerVisible: false,

      // --------------------groupManage
      multipleSelection: [],
      groupMsgList: [],
      total: 0,
      formInline: {
        type: "", // 类型
        u_login_id: "", // 用户账号
        state: "" // 状态
      },
      options: [
        {
          value: "1",
          label: "用户撤回"
        },
        {
          value: "2",
          label: "群主删除"
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
  methods: {
    localData() {
      var params = {
        admin_id: this.admin_id,
        token: this.token,
      };
      var adminUrl = this.Api + "Groups/getGroupsList"; // 获取用户列表
      this.$axios
        .post(adminUrl, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.tableData = response.data.groupInfo;
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
    // 解散群
    dissolveGroup(ugId) {
      this.$confirm("确定要解散群吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var url = this.Api + "Groups/dissolveGroup";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            ug_id: ugId
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
            message: "已取消"
          });
        });
      console.log(this.admin_id, this.token);
    },

    // 删除群消息
    // 1个月前 3个月前 6个月前的聊天记录
    deleteGroupMessage(ugId, time = 1) {
      this.$confirm("确定要删除群消息吗？暂定删除1个月前的记录！", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var url = this.Api + "Groups/deleteGroupMessage";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            ug_id: ugId,
            time: time
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

    handleSizeChange(val) {
      this.pagesize = val;
      //console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      //console.log(`当前页: ${val}`);
    },

    // ------------------groupManage

    SizeChange(val) {
      this.size = val;
      //console.log(`每页 ${val} 条`);
    },
    CurrentChange(val) {
      this.Page = val;
      //console.log(`当前页: ${val}`);
       var offset = this.Page * this.size - this.size;
       var params = {
        admin_id: this.admin_id,
        token: this.token,
        ug_id: this.ug_id,
        offset: offset,
        length: this.size,
        type: this.formInline.type,
        u_login_id: this.formInline.u_login_id,
        state: this.formInline.state
      };
       if (params.type || params.u_login_id || params.state) {
        var adminUrl = this.Api + "Groups/searchGroupMsg"; // 搜索条件不为空，走搜索接口
      } else {
        var adminUrl = this.Api + "Groups/getGroupMessage"; // 获取用户列表
      }

      this.$axios
        .post(adminUrl, this.$qs.stringify(params))
        .then(response => {
          this.groupMsgList = response.data.groupMsgList;
          console.log(this.groupMsgList);
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 多选框值
    handleSelectionChange(val) {
      this.multipleSelection = [];
      for (var item in val) {
        this.multipleSelection.push(val[item].gm_id);
      }
    },
    // 获取群消息列表
    groupMessage(ugId) {
      this.Page = 1; // 初始化页码
      this.groupMsgList = [];
      this.outerVisible = true;
      this.ug_id = ugId;
      this.formInline = [];
      var url = this.Api + "Groups/getGroupMessage";
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        ug_id: ugId
      };
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.total = response.data.total;
              this.groupMsgList = response.data.groupMsgList;
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
    },
    // 群消息删除
    delMsg(gm_id) {
      if (gm_id) {
        this.multipleSelection = [];
        this.multipleSelection.push(gm_id);
      }

      this.$confirm("确定要删除群消息吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var url = this.Api + "Groups/delGroupMsg";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            gm_ids: this.multipleSelection
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
                  this.groupMessage(this.ug_id);
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
    // 群消息搜索
    onSearch() {
      this.loading = true;
      console.log("查询", this.formInline);
      var url = this.Api + "Groups/searchGroupMsg";
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        ug_id: this.ug_id,
        type: this.formInline.type,
        u_login_id: this.formInline.u_login_id,
        state: this.formInline.state
      };
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.groupMsgList = [];
              this.groupMsgList = response.data.groupMsgList;
              this.total = response.data.total;
              this.loading = false;
              break;
            case 40001:
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
  },
  created() {
    if (!this.admin_id || !this.token) {
      this.$router.push({ path: "/Login" });
    }
    this.localData();
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
