<template>
  <div class="Notice">
    <el-tabs type="border-card">
      <template>
        <div style="width: 100%;margin-bottom: 20px;">
          <el-button id="add" type="primary" @click="dictionaryAdd()">增加</el-button>
          <el-table
            :data="tableData"
            row-key="id"
            stripe
            height="700"
            border
            default-expand-all
            :tree-props="{children: 'child', hasChildren: 'hasChild'}"
          >
            <el-table-column prop="id" label="ID" sortable width="100"></el-table-column>

            <el-table-column prop="title" label="标题" width="200"></el-table-column>

            <el-table-column prop="content" label="内容"></el-table-column>

            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <el-popover trigger="hover" placement="left">
                  <p>点击切换状态</p>
                  <div slot="reference" class="name-wrapper">
                    <el-button
                      size="mini"
                      v-if="scope.row.status == 1"
                      type="primary"
                      @click="editState(scope.row.id,status=0)"
                    >已发送</el-button>
                    <el-button
                      size="mini"
                      v-if="scope.row.status == 0"
                      type="danger"
                      @click="editState(scope.row.id,status=1)"
                    >未发送</el-button>
                  </div>
                </el-popover>
              </template>
            </el-table-column>

            <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>

            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" @click="dictionaryEdit(scope.row.id, scope.row)">编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="dictionaryDelete(scope.row.id, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
      <!-- </el-tab-pane> -->
    </el-tabs>
    <!-- 新增界面 -->
    <el-dialog title="新增" :visible.sync="addFormVisible" width="35%">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="标题" prop="title">
          <el-input v-model="addForm.title" auto-complete="off" placeholder="请输入标题"></el-input>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            :rows="5"
            placeholder="请输入内容"
            v-model="addForm.content"
            auto-complete="off"
          ></el-input>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <template>
            <el-radio v-model="addForm.status" :label="1">现在发送</el-radio>
            <el-radio v-model="addForm.status" :label="0">暂不发送</el-radio>
          </template>
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
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" auto-complete="off" placeholder="请输入标题"></el-input>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            :rows="5"
            placeholder="请输入内容"
            v-model="editForm.content"
            auto-complete="off"
          ></el-input>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <template>
            <el-radio v-model="editForm.status" :label="1">现在发送</el-radio>
            <el-radio v-model="editForm.status" :label="0">暂不发送</el-radio>
          </template>
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
  name: "Notice",
  data() {
    return {
      tableData: [],
      //编辑界面是否显示
      editFormVisible: false,
      editLoading: false,
      editFormRules: {
        title: [
          {
            required: true,
            message: "请输入标题",
            trigger: "blur"
          }
        ],
        content: [
          {
            required: true,
            message: "请输入内容",
            trigger: "blur"
          }
        ]
      },
      //编辑界面数据
      editForm: {
        title: "",
        status: "",
        content: "",
        id: ""
      },
      //字典新增界面是否显示
      addFormVisible: false,
      addLoading: false,
      addFormRules: {
        title: [
          {
            required: true,
            message: "请输入标题",
            trigger: "blur"
          }
        ],
        content: [
          {
            required: true,
            message: "请输入内容",
            trigger: "blur"
          }
        ]
      },
      //新增界面数据
      addForm: {
        title: "",
        status: 1,
        content: ""
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
      var url = this.Api + "notice/getNotice";
      this.axios
        .get(url)
        .then(response => {
          this.tableData = response.data.data;
          switch (response.data.code) {
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
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    dictionaryAdd() {
      this.addFormVisible = true;
      console.log("add");
    },
    addSubmit() {
      this.$refs.addForm.validate(valid => {
        if (this.valueId == null) {
          this.valueId = 0;
        }
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              title: this.addForm.title,
              status: this.addForm.status,
              content: this.addForm.content
            };

            console.log(params);

            // 发保存请求
            var url = this.Api + "notice/addNotice"; // 新增
            this.$axios
              .post(url, this.$qs.stringify(params))
              .then(response => {
                this.addLoading = false;
                var code = response.data.code;
                switch (code) {
                  case 200:
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
    dictionaryEdit(index, row) {
      console.log(Object.assign({}, row));
      var obj = Object.assign({}, row);
      this.editFormVisible = true;
      this.editForm = obj;
      this.editForm.id = index;
      console.log(index, row);
    },
    editSubmit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              title: this.editForm.title,
              status: this.editForm.status,
              content: this.editForm.content,
              id: this.editForm.id
            };

            // 发保存请求
            var url = this.Api + "notice/editNotice"; // 编辑
            this.$axios
              .post(url, this.$qs.stringify(params))
              .then(response => {
                this.editLoading = false;

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
    dictionaryDelete(index, row) {
      this.$confirm("确定删除吗？", "提示", {}).then(() => {
        var param = {
          id: index,
          admin_id: this.admin_id,
          token: this.token
        };
        var url = this.Api + "notice/delNotice"; // 删除
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
    editState(id, status) {
      var params = {
        id: id,
        status: status,
        admin_id: this.admin_id,
        token: this.token
      };
      var url = this.Api + "notice/editNoticeStatus";
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
    } 
  }
};
</script>

<style scoped>
.dictionary {
  width: 50%;
  float: right;
  margin-top: 10px;
}
#add {
  float: left;
}
</style>


