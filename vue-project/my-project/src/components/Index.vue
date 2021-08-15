<template>
  <div id="Index">
    <el-row type="flex" class="row-bg" justify="space-around">
      <el-col :span="3">
        <div class="grid-content bg-purple">注册用户总数</div>
        <div class="grid-content bg-purple">{{regNum?regNum:0}}</div>
      </el-col>
      <el-col :span="3">
        <div class="grid-content bg-purple">今日登录人数</div>
        <div class="grid-content bg-purple">{{todayLoginNum?todayLoginNum:0}}</div>
      </el-col>
      <el-col :span="3">
        <div class="grid-content bg-purple">当前在线人数</div>
        <div class="grid-content bg-purple">{{onlineNum?onlineNum:0}}</div>
      </el-col>
      <el-col :span="3">
        <div class="grid-content bg-purple">今日注册人数</div>
        <div class="grid-content bg-purple">{{todayRegNum?todayRegNum:0}}</div>
      </el-col>
      <el-col :span="3">
        <div class="grid-content bg-purple">当月注册人数</div>
        <div class="grid-content bg-purple">{{monthRegNum?monthRegNum:0}}</div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    name: "Index",
    data(){
      return {
        regNum: '', // 总注册人数
        todayLoginNum: '', // 今日登录人数
        onlineNum: '', // 当前在下人数
        todayRegNum: '', // 今日注册人数
        monthRegNum: '', // 月注册人数
        admin_id : sessionStorage.getItem('admin_id'),
        token: sessionStorage.getItem(sessionStorage.getItem('admin_id')+'token')
      }
    },
    methods: {
      localData(){
        var url = this.Api+'Index/getCount' // 首页数据统计
        this.axios.get(url).then((response) => {
          this.regNum        = response.data.regNum;
          this.todayLoginNum = response.data.todayLoginNum;
          this.onlineNum     = response.data.onlineNum;
          this.todayRegNum   = response.data.todayRegNum;
          this.monthRegNum   = response.data.monthRegNum;
          console.log(response.data)
        }).catch((error) => {
          console.log(error)
        })
      }
    },
    created(){
      if(!this.admin_id || !this.token){
        this.$router.push({path: '/Login'})
      }
      this.localData();
    }
  }

</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-col {
  border-radius: 4px;
}
.bg-purple {
  background: #eceef0;
  height: 30px;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #d0d2d6;
}
</style>