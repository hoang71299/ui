<template>
  <div class="container mx-auto p-2">
    <h1 class="text-xl font-bold mb-3">Báo Cáo Thống Kê</h1>

    <!-- Employee Statistics -->
    <div class="bg-white rounded-lg shadow-sm p-2 mb-2">
      <h2 class="text-lg font-semibold mb-2">Thống Kê Nhân Viên</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="stat-card bg-blue-50 p-2 rounded-lg">
          <h3 class="text-sm font-medium">Tổng số nhân viên</h3>
          <p class="text-xl font-bold text-blue-600">{{ totalEmployees }}</p>
        </div>
        <div class="stat-card bg-green-50 p-2 rounded-lg">
          <h3 class="text-sm font-medium">Nhân viên đang làm việc</h3>
          <p class="text-xl font-bold text-green-600">{{ activeEmployees }}</p>
        </div>
        <div class="stat-card bg-purple-50 p-2 rounded-lg h-[80px]">
          <h3 class="text-xs font-medium">Phân bố theo phòng ban</h3>
          <canvas ref="departmentChart" class="mt-1"></canvas>
        </div>
      </div>
    </div>

    <!-- Attendance Statistics -->
    <div class="bg-white rounded-lg shadow-sm p-2 mb-2">
      <h2 class="text-lg font-semibold mb-2">Thống Kê Chấm Công</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div class="stat-card h-[90px]">
          <h3 class="text-xs font-medium mb-1">Tỷ lệ đi làm trong tháng</h3>
          <canvas ref="attendanceChart" class="mt-1"></canvas>
        </div>
        <div class="stat-card h-[90px]">
          <h3 class="text-xs font-medium mb-1">Giờ làm trung bình</h3>
          <canvas ref="workingHoursChart" class="mt-1"></canvas>
        </div>
      </div>
    </div>

    <!-- KPI Statistics -->
    <div class="bg-white rounded-lg shadow-sm p-2 mb-2">
      <h2 class="text-lg font-semibold mb-2">Thống Kê KPI</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div class="stat-card h-[90px]">
          <h3 class="text-xs font-medium mb-1">Tỷ lệ hoàn thành KPI</h3>
          <canvas ref="kpiCompletionChart" class="mt-1"></canvas>
        </div>
        <div class="stat-card">
          <table class="min-w-full text-sm">
            <thead>
              <tr>
                <th class="text-left py-1">Tiêu chí KPI</th>
                <th class="text-right py-1">Tỷ lệ hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="kpi in kpiStats" :key="kpi.id">
                <td class="py-1">{{ kpi.name }}</td>
                <td class="text-right py-1">{{ kpi.completion }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Salary Statistics -->
    <div class="bg-white rounded-lg shadow-sm p-2">
      <h2 class="text-lg font-semibold mb-2">Thống Kê Lương</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="stat-card bg-yellow-50 p-2 rounded-lg">
          <h3 class="text-sm font-medium">Tổng quỹ lương</h3>
          <p class="text-xl font-bold text-yellow-600">{{ formatCurrency(totalSalaryFund) }}</p>
        </div>
        <div class="stat-card bg-pink-50 p-2 rounded-lg">
          <h3 class="text-sm font-medium">Lương trung bình</h3>
          <p class="text-xl font-bold text-pink-600">{{ formatCurrency(averageSalary) }}</p>
        </div>
        <div class="stat-card h-[80px]">
          <h3 class="text-xs font-medium mb-1">Phân bố lương</h3>
          <canvas ref="salaryDistributionChart" class="mt-1"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'StatisticalReport',
  setup() {
    const departmentChart = ref(null)
    const attendanceChart = ref(null)
    const workingHoursChart = ref(null)
    const kpiCompletionChart = ref(null)
    const salaryDistributionChart = ref(null)

    const totalEmployees = ref(0)
    const activeEmployees = ref(0)
    const totalSalaryFund = ref(0)
    const averageSalary = ref(0)
    const kpiStats = ref([])

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 6,
            padding: 2,
            font: {
              size: 8
            }
          }
        }
      }
    }

    const initCharts = () => {
      // Department Distribution Chart
      new Chart(departmentChart.value, {
        type: 'pie',
        data: {
          labels: ['IT', 'HR', 'Marketing', 'Sales'],
          datasets: [{
            data: [30, 20, 25, 25],
            backgroundColor: ['#60A5FA', '#34D399', '#A78BFA', '#F472B6']
          }]
        },
        options: {
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: {
              position: 'right',
              labels: {
                boxWidth: 4,
                padding: 2,
                font: {
                  size: 8
                }
              }
            }
          }
        }
      })

      // Attendance Chart
      new Chart(attendanceChart.value, {
        type: 'bar',
        data: {
          labels: ['T1', 'T2', 'T3', 'T4'],
          datasets: [{
            label: 'Tỷ lệ đi làm',
            data: [95, 92, 88, 90],
            backgroundColor: '#60A5FA'
          }]
        },
        options: {
          ...chartOptions,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                font: {
                  size: 8
                }
              }
            },
            x: {
              ticks: {
                font: {
                  size: 8
                }
              }
            }
          }
        }
      })

      // Working Hours Chart
      new Chart(workingHoursChart.value, {
        type: 'line',
        data: {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6'],
          datasets: [{
            label: 'Giờ làm trung bình',
            data: [8.5, 8.2, 8.7, 8.4, 8.1],
            borderColor: '#34D399',
            pointRadius: 2
          }]
        },
        options: {
          ...chartOptions,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              ticks: {
                font: {
                  size: 8
                }
              }
            },
            x: {
              ticks: {
                font: {
                  size: 8
                }
              }
            }
          }
        }
      })

      // KPI Completion Chart
      new Chart(kpiCompletionChart.value, {
        type: 'doughnut',
        data: {
          labels: ['Hoàn thành', 'Chưa hoàn thành'],
          datasets: [{
            data: [75, 25],
            backgroundColor: ['#34D399', '#F87171']
          }]
        },
        options: {
          ...chartOptions,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 4,
                padding: 2,
                font: {
                  size: 8
                }
              }
            }
          }
        }
      })

      // Salary Distribution Chart
      new Chart(salaryDistributionChart.value, {
        type: 'bar',
        data: {
          labels: ['<5M', '5-10M', '10-15M', '15-20M', '>20M'],
          datasets: [{
            label: 'Số nhân viên',
            data: [5, 15, 25, 10, 5],
            backgroundColor: '#F472B6'
          }]
        },
        options: {
          ...chartOptions,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              ticks: {
                font: {
                  size: 8
                }
              }
            },
            x: {
              ticks: {
                font: {
                  size: 8
                }
              }
            }
          }
        }
      })
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value)
    }

    onMounted(async () => {
      // Simulate API calls to get data
      totalEmployees.value = 100
      activeEmployees.value = 95
      totalSalaryFund.value = 500000000
      averageSalary.value = 15000000
      kpiStats.value = [
        { id: 1, name: 'Hiệu suất công việc', completion: 85 },
        { id: 2, name: 'Chất lượng công việc', completion: 90 },
        { id: 3, name: 'Đúng giờ', completion: 95 }
      ]

      initCharts()
    })

    return {
      totalEmployees,
      activeEmployees,
      totalSalaryFund,
      averageSalary,
      kpiStats,
      departmentChart,
      attendanceChart,
      workingHoursChart,
      kpiCompletionChart,
      salaryDistributionChart,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>