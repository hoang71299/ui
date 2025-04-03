<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Loại Vắng</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Loại Vắng
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Yêu Cầu Phê Duyệt</label>
                <select class="form-select" v-model="filters.yeuCauPheDuyet">
                  <option value="">Tất cả</option>
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </div>
              <div class="col-md-9">
                <label class="form-label">Tìm Kiếm</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Tìm theo tên loại vắng..."
                    v-model="filters.search">
                  <button class="btn btn-outline-primary" type="button">
                    <i class="bx bx-search"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Bảng dữ liệu -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Tên Loại Vắng</th>
                    <th>Điểm Trừ</th>
                    <th>Yêu Cầu Phê Duyệt</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="loaiVang in filteredLoaiVangs" :key="loaiVang.id_loai_vang">
                    <td>{{ loaiVang.id_loai_vang }}</td>
                    <td>{{ loaiVang.ten_loai_vang }}</td>
                    <td>{{ loaiVang.diem_tru_boi }}</td>
                    <td>
                      <span :class="loaiVang.yeu_cau_phe_duyet ? 'badge bg-primary' : 'badge bg-secondary'">
                        {{ loaiVang.yeu_cau_phe_duyet ? 'Có' : 'Không' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editLoaiVang(loaiVang)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteLoaiVang(loaiVang)">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredLoaiVangs.length === 0">
                    <td colspan="5" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredLoaiVangs.length }} / {{ loaiVangs.length }} loại vắng
              </div>
              <nav>
                <ul class="pagination mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="currentPage--">Trước</a>
                  </li>
                  <li v-for="page in totalPages" :key="page" class="page-item"
                    :class="{ active: page === currentPage }">
                    <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="currentPage++">Sau</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Thêm/Sửa Loại Vắng -->
    <div class="modal fade" id="loaiVangModal" tabindex="-1" aria-hidden="true" ref="loaiVangModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Loại Vắng' : 'Thêm Loại Vắng Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveLoaiVang">
              <div class="mb-3">
                <label class="form-label">Tên Loại Vắng</label>
                <input type="text" class="form-control" v-model="formData.ten_loai_vang" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Điểm Trừ</label>
                <input type="number" class="form-control" v-model="formData.diem_tru_boi" min="0" required>
                <small class="text-muted">Số điểm trừ khi nhân viên vắng mặt với lý do này</small>
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="yeuCauPheDuyet"
                  v-model="formData.yeu_cau_phe_duyet">
                <label class="form-check-label" for="yeuCauPheDuyet">Yêu cầu phê duyệt</label>
                <div class="form-text">Nếu được chọn, đăng ký vắng với lý do này sẽ cần được phê duyệt trước khi có hiệu
                  lực</div>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Xóa -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác Nhận Xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedLoaiVang">
            <p>Bạn có chắc chắn muốn xóa loại vắng <strong>{{ selectedLoaiVang.ten_loai_vang }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác và có thể ảnh hưởng đến các đăng ký vắng hiện tại!
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap';

export default {
  name: 'QuanLyLoaiVang',
  data() {
    return {
      loaiVangs: [],
      selectedLoaiVang: null,
      isEditing: false,
      formData: {
        ten_loai_vang: '',
        diem_tru_boi: 0,
        yeu_cau_phe_duyet: true
      },
      filters: {
        yeuCauPheDuyet: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      loaiVangModal: null,
      deleteModal: null
    };
  },
  computed: {
    filteredLoaiVangs() {
      let filtered = [...this.loaiVangs];

      if (this.filters.yeuCauPheDuyet !== '') {
        const requireApproval = this.filters.yeuCauPheDuyet === 'true';
        filtered = filtered.filter(lv => lv.yeu_cau_phe_duyet === requireApproval);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(lv =>
          lv.ten_loai_vang.toLowerCase().includes(searchTerm)
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.loaiVangs.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.$nextTick(() => {
      this.initModals();
    });
  },
  methods: {
    initModals() {
      this.loaiVangModal = new Modal(this.$refs.loaiVangModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
    },
    async fetchData() {
      try {
        // Fetch loại vắng
        const response = await axios.get('http://127.0.0.1:8000/api/loai-vang');
        this.loaiVangs = response.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.loaiVangs = [
          {
            id_loai_vang: 1,
            ten_loai_vang: 'Nghỉ phép có lương',
            diem_tru_boi: 0,
            yeu_cau_phe_duyet: true
          },
          {
            id_loai_vang: 2,
            ten_loai_vang: 'Nghỉ phép không lương',
            diem_tru_boi: 5,
            yeu_cau_phe_duyet: true
          },
          {
            id_loai_vang: 3,
            ten_loai_vang: 'Nghỉ ốm',
            diem_tru_boi: 0,
            yeu_cau_phe_duyet: true
          },
          {
            id_loai_vang: 4,
            ten_loai_vang: 'Nghỉ thai sản',
            diem_tru_boi: 0,
            yeu_cau_phe_duyet: true
          },
          {
            id_loai_vang: 5,
            ten_loai_vang: 'Đi muộn',
            diem_tru_boi: 2,
            yeu_cau_phe_duyet: false
          },
          {
            id_loai_vang: 6,
            ten_loai_vang: 'Về sớm',
            diem_tru_boi: 2,
            yeu_cau_phe_duyet: false
          },
          {
            id_loai_vang: 7,
            ten_loai_vang: 'Vắng không phép',
            diem_tru_boi: 10,
            yeu_cau_phe_duyet: false
          }
        ];
      }
    },
    resetForm() {
      this.formData = {
        ten_loai_vang: '',
        diem_tru_boi: 0,
        yeu_cau_phe_duyet: true
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.loaiVangModal.show();
    },
    editLoaiVang(loaiVang) {
      this.isEditing = true;
      this.selectedLoaiVang = loaiVang;
      this.formData = { ...loaiVang };
      this.loaiVangModal.show();
    },
    deleteLoaiVang(loaiVang) {
      this.selectedLoaiVang = loaiVang;
      this.deleteModal.show();
    },
    async saveLoaiVang() {
      try {
        if (this.isEditing) {
          // Cập nhật loại vắng
          await axios.put(`http://127.0.0.1:8000/api/loai-vang/${this.selectedLoaiVang.id_loai_vang}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.loaiVangs.findIndex(lv => lv.id_loai_vang === this.selectedLoaiVang.id_loai_vang);
          if (index !== -1) {
            this.loaiVangs[index] = { ...this.loaiVangs[index], ...this.formData };
          }

          alert('Cập nhật loại vắng thành công!');
        } else {
          // Thêm loại vắng mới
          const response = await axios.post('http://127.0.0.1:8000/api/loai-vang', this.formData);
          this.loaiVangs.push(response.data);

          alert('Thêm loại vắng thành công!');
        }

        this.loaiVangModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving absence type:', error);
        alert(`Lỗi khi lưu loại vắng: ${error.response?.data?.message || error.message}`);
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/loai-vang/${this.selectedLoaiVang.id_loai_vang}`);

        // Xóa loại vắng khỏi mảng
        this.loaiVangs = this.loaiVangs.filter(lv => lv.id_loai_vang !== this.selectedLoaiVang.id_loai_vang);

        alert('Xóa loại vắng thành công!');
        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting absence type:', error);
        alert(`Lỗi khi xóa loại vắng: ${error.response?.data?.message || error.message}`);
      }
    }
  }
};
</script>

<style scoped>
.badge {
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
}

.table th {
  white-space: nowrap;
}
</style>