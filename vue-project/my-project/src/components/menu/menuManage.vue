<template>
  <div class="MenuManage">
    <template>
      <el-button id="add" type="primary" @click="handleAdd()">增加</el-button>

      <el-table
        :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
        height="750"
        stripe
        border
        row-key="menu_id"
        style="width: 100%;margin-bottom: 20px;"
        @selection-change="handleSelectionChange"
        default-expand-all
        :tree-props="{children: 'child', hasChildren: 'hasChildren'}"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="menu_id" label="ID" width="120"></el-table-column>

        <el-table-column prop="title" label="权限名称" width="180"></el-table-column>

        <el-table-column prop="p_id" label="父级ID" width="80"></el-table-column>

        <el-table-column prop="url" label="URL"></el-table-column>

        <el-table-column prop="status" width="55" label="状态"></el-table-column>

        <el-table-column prop="create_time" label="创建时间" width="200"></el-table-column>

        <el-table-column prop="update_time" label="修改时间" width="200"></el-table-column>

        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row.menu_id, scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row.menu_id, scope.row)"
            >删除</el-button>
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
        <el-form-item label="菜单" prop="radio">
          <template>
            <el-radio v-model="addForm.radio" :label="1">是</el-radio>
            <el-radio v-model="addForm.radio" :label="0">否</el-radio>
          </template>
        </el-form-item>
        <el-form-item label="父级" prop="menu_id">
          <template>
            <el-select :value="valueId" :clearable="clearable" @clear="clearHandle">
              <el-option :value="valueId" :label="valueTitle">
                <el-tree
                  id="tree-option"
                  ref="selectTree"
                  :accordion="accordion"
                  :data="tableData"
                  :props="props"
                  :node-key="props.value"
                  :default-expanded-keys="defaultExpandedKey"
                  @node-click="handleNodeClick"
                ></el-tree>
              </el-option>
            </el-select>
          </template>
        </el-form-item>
        <el-form-item label="名称" prop="title">
          <el-input v-model="addForm.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="url规则" prop="url">
          <el-input v-model="addForm.url" placeholder="controller/action" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <template>
            <el-radio v-model="addForm.status" :label="1">正常</el-radio>
            <el-radio v-model="addForm.status" :label="0">隐藏</el-radio>
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
        <el-form-item label="菜单" prop="radio">
          <template>
            <el-radio v-model="editForm.radio" :label="1">是</el-radio>
            <el-radio v-model="editForm.radio" :label="0">否</el-radio>
          </template>
        </el-form-item>
        <el-form-item label="父级" prop="menu_id">
          <template>
            <el-select :value="valueId" :clearable="clearable" @clear="clearHandle">
              <el-option :value="valueId" :label="valueTitle">
                <el-tree
                  id="tree-option"
                  ref="selectTree"
                  :accordion="accordion"
                  :data="tableData"
                  :props="props"
                  :node-key="props.value"
                  :default-expanded-keys="defaultExpandedKey"
                  @node-click="handleNodeClick"
                ></el-tree>
              </el-option>
            </el-select>
          </template>
        </el-form-item>
        <el-form-item label="名称" prop="title">
          <el-input v-model="editForm.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="url规则" prop="url">
          <el-input v-model="editForm.url" placeholder="controller/action" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <template>
            <el-radio v-model="editForm.status" :label="1">正常</el-radio>
            <el-radio v-model="editForm.status" :label="0">隐藏</el-radio>
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
  name: "MenuManage",
  props: {
    /* 配置项 */
    props: {
      type: Object,
      default: () => {
        return {
          value: "menu_id", // ID字段名
          label: "title", // 显示名称
          children: "child" // 子级字段名
        };
      }
    },
    /* 选项列表数据(树形结构的对象数组) */
    options: {
      type: Array,
      default: () => {
        return [];
      }
    },
    /* 初始值 */
    value: {
      type: Number,
      default: () => {
        return 0;
      }
    },
    /* 可清空选项 */
    clearable: {
      type: Boolean,
      default: () => {
        return true;
      }
    },
    /* 自动收起 */
    accordion: {
      type: Boolean,
      default: () => {
        return false;
      }
    }
  },
  data() {
    return {
      tableData: [],
      multipleSelection: [],
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据

      //编辑界面是否显示
      editFormVisible: false,
      editLoading: false,
      editFormRules: {
        name: [
          {
            required: true,
            message: "请输入角色名称",
            trigger: "blur"
          }
        ]
      },
      //编辑界面数据
      editForm: {
        title: "",
        url: "",
        radio: "",
        status: "",
        menu_id: ""
      },

      //新增界面是否显示
      addFormVisible: false,
      addLoading: false,
      addFormRules: {
        title: [
          {
            required: true,
            message: "请输入角色名称",
            trigger: "blur"
          }
        ],
        url: [
          {
            required: true,
            message: "请输入控制器",
            trigger: "blur"
          }
        ]
      },
      //新增界面数据
      addForm: {
        title: "",
        url: "",
        radio: 1,
        status: 1
      },

      valueId: this.value, // 初始值
      valueTitle: "",
      defaultExpandedKey: [],
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      )
    };
  },
  methods: {
    loadData() {
      var roleUrl = this.Api + "Menu/menu"; // 获取权限列表

      this.axios
        .get(roleUrl)
        .then(response => {
          this.tableData = response.data;
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
          //console.log(response.data)
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
    handleEdit(index, row) {
      var obj = Object.assign({}, row);
      this.editFormVisible = true;
      this.editForm = obj;
      this.editForm.radio = obj.is_menu;
      this.valueId = obj.p_id;
      this.editForm.menu_id = index;
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
              menuName: this.editForm.title,
              url: this.editForm.url,
              p_id: this.valueId,
              is_menu: this.editForm.radio,
              status: this.editForm.status,
              menu_id: this.editForm.menu_id
            };

            // 发保存请求
            var url = this.Api + "Menu/menuEdit";
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
    handleDelete(index, row) {
      this.$confirm("确定删除吗？", "提示", {}).then(() => {
        var param = {
          menuId: index,
          admin_id: this.admin_id,
          token: this.token
        };
        var url = this.Api + "Menu/deleteMenu"; // 删除权限节点
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
    handleAdd() {
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
              menuName: this.addForm.title,
              url: this.addForm.url,
              p_id: this.valueId,
              is_menu: this.addForm.radio,
              status: this.addForm.status
            };
            console.log(params);

            // 发保存请求
            var url = this.Api + "Menu/menuAdd"; // 添加权限
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
    handleSizeChange(val) {
      this.pagesize = val;
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      console.log(`当前页: ${val}`);
    },
    // 初始化值
    initHandle() {
      if (this.valueId) {
        this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data[
          this.props.label
        ]; // 初始化显示
        this.$refs.selectTree.setCurrentKey(this.valueId); // 设置默认选中
        this.defaultExpandedKey = [this.valueId]; // 设置默认展开
      }
      this.$nextTick(() => {
        let scrollWrap = document.querySelectorAll(
          ".el-scrollbar .el-select-dropdown__wrap"
        )[0];
        let scrollBar = document.querySelectorAll(
          ".el-scrollbar .el-scrollbar__bar"
        );
        scrollWrap.style.cssText =
          "margin: 0px; max-height: none; overflow: hidden;";
        scrollBar.forEach(ele => (ele.style.width = 0));
      });
    },
    // 切换选项
    handleNodeClick(node) {
      this.valueTitle = node[this.props.label];
      this.valueId = node[this.props.value];
      this.$emit("getValue", this.valueId);
      this.defaultExpandedKey = [];
    },
    // 清除选中
    clearHandle() {
      this.valueTitle = "";
      this.valueId = null;
      this.defaultExpandedKey = [];
      this.clearSelected();
      this.$emit("getValue", null);
    },
    /* 清空选中样式 */
    clearSelected() {
      let allNode = document.querySelectorAll("#tree-option .el-tree-node");
      allNode.forEach(element => element.classList.remove("is-current"));
    }
  },
  created: function() {
    if (!this.admin_id || !this.token) {
      this.$router.push({ path: "/Login" });
    }
    this.loadData();
  },
  mounted() {
    this.initHandle();
  },
  watch: {
    value() {
      this.valueId = this.value;
      this.initHandle();
    }
  }
};
</script>

<style scoped>
#add {
  float: left;
}
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  max-height: 274px;
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
}
.el-select-dropdown__item.selected {
  font-weight: normal;
}
ul li >>> .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
}
.el-tree-node__label {
  font-weight: normal;
}
.el-tree >>> .is-current .el-tree-node__label {
  color: #409eff;
  font-weight: 700;
}
.el-tree >>> .is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}
</style>
