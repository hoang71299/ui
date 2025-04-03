<template>
  <div class="container-fluid">
    <div class="page-breadcrumb d-flex align-items-center mb-3">
      <div class="breadcrumb-title pe-3">Dashboard</div>
      <div class="ps-3 ms-auto">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 p-0">
            <li class="breadcrumb-item"><router-link to="/"><i class="bx bx-home-alt"></i></router-link></li>
            <li class="breadcrumb-item active" aria-current="page">Dashboard</li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Thẻ thống kê -->
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 row-cols-xl-4">
      <div class="col">
        <div class="card radius-10">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div>
                <p class="mb-0 text-secondary">Tổng nhân viên</p>
                <h4 class="my-1">{{ statistic.totalEmployees }}</h4>
                <p class="mb-0 font-13 text-success">
                  <i class="bx bxs-up-arrow align-middle"></i>
                  <span>{{ statistic.newEmployees }}</span> nhân viên mới tháng này
                </p>
              </div>
              <div class="widget-icon-large bg-gradient-purple text-white ms-auto">
                <i class="bx bxs-group"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card radius-10">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div>
                <p class="mb-0 text-secondary">Tỷ lệ chuyên cần</p>
                <h4 class="my-1">{{ statistic.attendanceRate }}%</h4>
                <p class="mb-0 font-13" :class="statistic.attendanceChange >= 0 ? 'text-success' : 'text-danger'">
                  <i :class="statistic.attendanceChange >= 0 ? 'bx bxs-up-arrow' : 'bx bxs-down-arrow'"></i>
                  <span>{{ Math.abs(statistic.attendanceChange) }}%</span> so với tháng trước
                </p>
              </div>
              <div class="widget-icon-large bg-gradient-success text-white ms-auto">
                <i class="bx bxs-calendar-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card radius-10">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div>
                <p class="mb-0 text-secondary">Đơn nghỉ phép</p>
                <h4 class="my-1">{{ statistic.leaveRequests }}</h4>
                <p class="mb-0 font-13 text-warning">
                  <i class="bx bx-time"></i>
                  <span>{{ statistic.pendingLeaveRequests }}</span> chờ phê duyệt
                </p>
              </div>
              <div class="widget-icon-large bg-gradient-danger text-white ms-auto">
                <i class="bx bxs-calendar-x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card radius-10">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div>
                <p class="mb-0 text-secondary">Tỷ lệ KPI đạt</p>
                <h4 class="my-1">{{ statistic.kpiRate }}%</h4>
                <p class="mb-0 font-13" :class="statistic.kpiChange >= 0 ? 'text-success' : 'text-danger'">
                  <i :class="statistic.kpiChange >= 0 ? 'bx bxs-up-arrow' : 'bx bxs-down-arrow'"></i>
                  <span>{{ Math.abs(statistic.kpiChange) }}%</span> so với quý trước
                </p>
              </div>
              <div class="widget-icon-large bg-gradient-info text-white ms-auto">
                <i class="bx bxs-bar-chart-alt-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Biểu đồ nhân sự theo phòng ban -->
      <div class="col-12 col-lg-8">
        <div class="card radius-10">
          <div class="card-header bg-transparent">
            <div class="d-flex align-items-center">
              <div>
                <h6 class="mb-0">Phân bố nhân sự theo phòng ban</h6>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 300px">
              <canvas id="chart1"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Biểu đồ tròn phân bố theo chức danh -->
      <div class="col-12 col-lg-4">
        <div class="card radius-10">
          <div class="card-header bg-transparent">
            <div class="d-flex align-items-center">
              <div>
                <h6 class="mb-0">Phân bố theo chức danh</h6>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 300px">
              <canvas id="chart2"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Nhân viên mới nhất -->
      <div class="col-12 col-lg-6">
        <div class="card radius-10">
          <div class="card-header bg-transparent">
            <div class="d-flex align-items-center">
              <div>
                <h6 class="mb-0">Nhân viên mới nhất</h6>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Nhân viên</th>
                    <th>Phòng ban</th>
                    <th>Ngày vào</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(employee, index) in newEmployees" :key="index">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="employee-avatar">
                          <span class="employee-avatar-text">{{ getInitials(employee.name) }}</span>
                        </div>
                        <div class="ms-2">
                          <h6 class="mb-0 font-14">{{ employee.name }}</h6>
                          <p class="mb-0 font-13 text-secondary">{{ employee.position }}</p>
                        </div>
                      </div>
                    </td>
                    <td>{{ employee.department }}</td>
                    <td>{{ employee.joinDate }}</td>
                    <td>
                      <span class="badge" :class="'bg-' + employee.statusColor">{{ employee.status }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Chấm công hôm nay -->
      <div class="col-12 col-lg-6">
        <div class="card radius-10">
          <div class="card-header bg-transparent">
            <div class="d-flex align-items-center">
              <div>
                <h6 class="mb-0">Chấm công hôm nay {{ today }}</h6>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="attendance-summary d-flex mb-3">
              <div class="flex-grow-1 text-center">
                <h5>{{ attendance.present }}</h5>
                <p class="mb-0 text-success">Có mặt</p>
              </div>
              <div class="flex-grow-1 text-center">
                <h5>{{ attendance.absent }}</h5>
                <p class="mb-0 text-danger">Vắng mặt</p>
              </div>
              <div class="flex-grow-1 text-center">
                <h5>{{ attendance.late }}</h5>
                <p class="mb-0 text-warning">Đi muộn</p>
              </div>
              <div class="flex-grow-1 text-center">
                <h5>{{ attendance.leave }}</h5>
                <p class="mb-0 text-info">Nghỉ phép</p>
              </div>
            </div>
            <div class="progress">
              <div class="progress-bar bg-success" :style="'width:' + attendancePercentage.present + '%'"></div>
              <div class="progress-bar bg-danger" :style="'width:' + attendancePercentage.absent + '%'"></div>
              <div class="progress-bar bg-warning" :style="'width:' + attendancePercentage.late + '%'"></div>
              <div class="progress-bar bg-info" :style="'width:' + attendancePercentage.leave + '%'"></div>
            </div>
          </div>
        </div>

        <!-- Sinh nhật sắp tới -->
        <div class="card radius-10 mt-3">
          <div class="card-header bg-transparent">
            <div class="d-flex align-items-center">
              <div>
                <h6 class="mb-0">Sinh nhật sắp tới</h6>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="upcomingBirthdays.length > 0">
              <div class="d-flex align-items-center mb-3" v-for="(birthday, index) in upcomingBirthdays" :key="index">
                <div class="employee-avatar">
                  <span class="employee-avatar-text">{{ getInitials(birthday.name) }}</span>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="mb-0">{{ birthday.name }}</h6>
                  <p class="mb-0 text-secondary">{{ birthday.date }}</p>
                </div>
                <div class="ms-auto">
                  <span class="badge rounded-pill bg-light text-dark">{{ birthday.daysLeft }} ngày nữa</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-3 text-secondary">
              Không có sinh nhật sắp tới trong 30 ngày tới
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'DashboardComponent',
  data() {
    return {
      today: new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }),
      statistic: {
        totalEmployees: 87,
        newEmployees: 5,
        attendanceRate: 95.3,
        attendanceChange: 2.1,
        leaveRequests: 12,
        pendingLeaveRequests: 4,
        kpiRate: 89.7,
        kpiChange: -1.2
      },
      departmentData: [
        { name: 'Phòng Nhân sự', count: 12 },
        { name: 'Phòng Kế toán', count: 15 },
        { name: 'Phòng Kinh doanh', count: 25 },
        { name: 'Phòng IT', count: 20 },
        { name: 'Ban Giám đốc', count: 5 },
        { name: 'Phòng Marketing', count: 10 }
      ],
      positionData: [
        { name: 'Nhân viên', count: 60 },
        { name: 'Trưởng phòng', count: 8 },
        { name: 'Phó phòng', count: 7 },
        { name: 'Giám đốc', count: 5 },
        { name: 'Thực tập sinh', count: 7 }
      ],
      newEmployees: [
        { name: 'Nguyễn Văn A', position: 'Nhân viên IT', department: 'Phòng IT', joinDate: '15/03/2023', status: 'Thử việc', statusColor: 'warning' },
        { name: 'Trần Thị B', position: 'Kế toán viên', department: 'Phòng Kế toán', joinDate: '01/03/2023', status: 'Thử việc', statusColor: 'warning' },
        { name: 'Lê Văn C', position: 'Nhân viên Marketing', department: 'Phòng Marketing', joinDate: '20/02/2023', status: 'Chính thức', statusColor: 'success' },
        { name: 'Phạm Thị D', position: 'Nhân viên Kinh doanh', department: 'Phòng Kinh doanh', joinDate: '15/02/2023', status: 'Chính thức', statusColor: 'success' },
        { name: 'Hoàng Văn E', position: 'Thực tập sinh', department: 'Phòng IT', joinDate: '10/02/2023', status: 'Thực tập', statusColor: 'info' }
      ],
      attendance: {
        present: 78,
        absent: 3,
        late: 4,
        leave: 2
      },
      upcomingBirthdays: [
        { name: 'Nguyễn Thị F', date: '05/04/2023', daysLeft: 2 },
        { name: 'Trần Văn G', date: '10/04/2023', daysLeft: 7 },
        { name: 'Lê Thị H', date: '15/04/2023', daysLeft: 12 }
      ],
      chart1: null,
      chart2: null
    }
  },
  computed: {
    attendancePercentage() {
      const total = this.attendance.present + this.attendance.absent + this.attendance.late + this.attendance.leave;
      return {
        present: (this.attendance.present / total) * 100,
        absent: (this.attendance.absent / total) * 100,
        late: (this.attendance.late / total) * 100,
        leave: (this.attendance.leave / total) * 100
      }
    }
  },
  mounted() {
    this.initCharts();
  },
  methods: {
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    initCharts() {
      // Biểu đồ cột phân bố nhân sự theo phòng ban
      const ctx1 = document.getElementById('chart1').getContext('2d');
      this.chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: this.departmentData.map(item => item.name),
          datasets: [{
            label: 'Số lượng nhân viên',
            data: this.departmentData.map(item => item.count),
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      // Biểu đồ tròn phân bố theo chức danh
      const ctx2 = document.getElementById('chart2').getContext('2d');
      this.chart2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: this.positionData.map(item => item.name),
          datasets: [{
            data: this.positionData.map(item => item.count),
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #555;
}

.employee-avatar-text {
  font-size: 16px;
}

.widget-icon-large {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.widget-icon-large i {
  font-size: 24px;
}

.bg-gradient-purple {
  background: linear-gradient(45deg, #8e33ff, #6c5dd3);
}

.bg-gradient-success {
  background: linear-gradient(45deg, #17a00e, #56ca00);
}

.bg-gradient-danger {
  background: linear-gradient(45deg, #fd3550, #ff5e62);
}

.bg-gradient-info {
  background: linear-gradient(45deg, #0771f7, #18a9e9);
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.progress {
  height: 12px;
  border-radius: 6px;
}
</style>