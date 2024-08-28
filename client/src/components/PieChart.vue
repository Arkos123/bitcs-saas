<!-- PieChart.vue -->
<template>
  <div>
    <Pie :data="chartData" :options="chartOptions"></Pie>
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  components: {
    Pie
  },
  props: {
    projects: {
      type: Object,
      required: true
    },
    projectInfo: {
      type: Object,
      required: true
    }
  },
  computed: {
    chartData() {
      const projectEntries = Object.entries(this.projects)
      const ratios = projectEntries.map(([key, value]) => value.ratio)
      const totalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0)
      if (totalRatio < 1) {
        projectEntries.push(['空闲', { ratio: 1 - totalRatio }])
      }
      return {
        labels: projectEntries.map(([key]) => key === '空闲' ? key : this.projectInfo[key]?.name ?? '未知项目'),
        datasets: [
          {
            backgroundColor: projectEntries.map(([key]) => this.getRandomColor(key)),
            data: projectEntries.map(([key, value]) => value.ratio)
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 10
            },
            onClick: null,
            // (event, legendItem, legend) => {
            //   this.$emit('legend-clicked', legendItem.text)
            //   // 阻止默认的点击行为
            //   event.stopPropagation()
            // },
            // labels: {
            //   usePointStyle: true
            // }
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                //tooltipItem.label
                return '比例: ' + (tooltipItem.raw *100).toFixed(0) + '%'
              }
            }
          }
        }
      }
    }
  },
  methods: {
    getRandomColor(key) {
      if (key === '空闲') {
        return '#00DD00'
      }
      // Simple hash function to generate a color based on the key
      let hash = 0
      for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash)
      }
      // Calculate color
      let color = '#'
      for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xff
        color += ('00' + value.toString(16)).slice(-2)
      }

      return color
    }
  }
}
</script>

<style scoped>
div {
  max-height: 170px;
  margin: auto; /* 可以根据需要调整居中 */
}
</style>
