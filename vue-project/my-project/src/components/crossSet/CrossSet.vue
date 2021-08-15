<template>
  <div class="CrossSet">
    <template>
      <el-button id="add" type="primary" @click="handleAdd()">增加</el-button>

      <el-table
        :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
        height="750"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="id" label="ID" width="55"></el-table-column>

        <el-table-column prop="address" label="允许跨域域名"></el-table-column>

        <el-table-column label="启/禁用" width="155">
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="left">
              <p>点击切换状态</p>
              <div slot="reference" class="name-wrapper">
                <el-button
                  size="mini"
                  v-if="scope.row.status == '启用'"
                  type="primary"
                  @click="editState(scope.row.id,status=0)"
                >{{scope.row.status}}</el-button>
                <el-button
                  size="mini"
                  v-if="scope.row.status == '禁用'"
                  type="danger"
                  @click="editState(scope.row.id,status=1)"
                >{{scope.row.status}}</el-button>
              </div>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column prop="update_time" label="修改时间" width="200"></el-table-column>

        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row.id, scope.row)">编辑</el-button>
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
        :total="tableData.length"
      ></el-pagination>
    </template>
    <!-- 新增界面 -->
    <el-dialog title="新增" :visible.sync="addFormVisible" width="35%">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="域名" prop="address">
          <el-input v-model="addForm.address" placeholder="请输入域名" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" width="35%">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="域名" prop="address">
          <el-input v-model="editForm.address" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "CrossSet",
  data() {
    return {
      tableData: [],
      multipleSelection: [],
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据

      roleOptions: [],

      //编辑界面是否显示
      editFormVisible: false,
      editLoading: false,

      //编辑界面数据
      editForm: {
        address: "",
        id: ""
      },
      editFormRules: {
        address: [
          {
            required: true,
            message: "请输入域名",
            trigger: "blur"
          }
        ]
      },
      //新增界面是否显示
      addFormVisible: false,
      addLoading: false,
      addFormRules: {
        address: [
          {
            required: true,
            message: "请输入域名",
            trigger: "blur"
          }
        ]
      },
      //新增界面数据
      addForm: {
        address: ""
      },
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      )
    };
  },
  created: function() {
    if (!this.admin_id || !this.token) {
      this.$router.push({ path: "/Login" });
    }
    this.loadData();
  },
  methods: {
    loadData() {
      var adminUrl = this.Api + "Cross/getCross"; // 获取跨域域名

      this.$axios
        .get(adminUrl)
        .then(response => {
          switch (response.data.code) {
            case 200:
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
          console.log(this.tableData);
        })
        .catch(error => {
          console.log(error);
        });
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(this.multipleSelection);
    },
    // 调起编辑页面
    handleEdit(index, row) {
      var obj = Object.assign({}, row);
      this.editFormVisible = true;
      this.editForm = obj;
      this.editForm.id = index;

      console.log(this.editForm);
      //console.log(index, row);
    },
    handleDelete(index, row) {
      this.$confirm("确认删除吗？", "提示", {}).then(() => {
        var param = {
          admin_id: this.admin_id,
          token: this.token,
          id: index
        };
        var url = this.Api + "Cross/deleteCross"; // 删除
        this.$axios
          .post(url, this.$qs.stringify(param))
          .then(response => {
            var code = response.data.code;
            switch (code) {
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
              default:
                this.$message.error(response.data.msg);
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
    // 调起新增页面
    handleAdd() {
      this.addFormVisible = true;
    },
    editSubmit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            var params = {
              id: this.editForm.id,
              admin_id: this.admin_id,
              token: this.token,
              address: this.editForm.address
            };
            console.log(params);
            // 发保存请求
            var url = this.Api + "Cross/upCross"; // 编辑
            this.$axios
              .post(url, this.$qs.stringify(params))
              .then(response => {
                this.editLoading = false;
                console.log(response.data.code);
                var code = response.data.code;
                switch (code) {
                  case 200:
                    // 表单重置
                    this.$refs["editForm"].resetFields();
                    this.editFormVisible = false;
                    this.loadData();

                    this.$message({
                      showClose: true,
                      type: "success",
                      message: response.data.msg
                    });
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
                  default:
                    this.$message.error(response.data.msg);
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
        }
      });
    },
    addSubmit() {
     
      this.$refs.addForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              address: this.addForm.address
            };

            // 发保存请求
            var url = this.Api + "Cross/addCross"; // 新增
            this.$axios
              .post(url, this.$qs.stringify(params))
              .then(response => {
                this.addLoading = false;

                var code = response.data.code;
                switch (code) {
                  case 200:
                    this.$message({
                      showClose: true,
                      type: "success",
                      message: response.data.msg
                    });
                    // 表单重置
                    this.$refs["addForm"].resetFields();
                    this.addFormVisible = false;
                    this.loadData();
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
                  default:
                    this.$message.error(response.data.msg);
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
        }
      });
    },
    editState(id, status) {
      var params = {
        id: id,
        status: status,
        admin_id: this.admin_id,
        token: this.token
      };
      var url = this.Api + "Cross/editCross"; // 修改状态
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          this.addLoading = false;

          var code = response.data.code;
          switch (code) {
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
            default:
              this.$message.error(response.data.msg);
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
    handleSizeChange(val) {
      this.pagesize = val;
      //console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      //console.log(`当前页: ${val}`);
    }
  }
};
</script>

<style scoped>
#add {
  float: left;
}
</style>

