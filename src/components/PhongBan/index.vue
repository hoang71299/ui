<template>
  <div class="container-fluid">
    <div class="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
      <div class="breadcrumb-title pe-3">Quản lý</div>
      <div class="ps-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 p-0">
            <li class="breadcrumb-item">
              <a href="javascript:;"><i class="bx bx-home-alt"></i></a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Phòng ban</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <h5 class="mb-0">Danh sách Phòng ban</h5>
          <div class="ms-auto position-relative">
            <div class="position-absolute top-50 translate-middle-y search-icon px-3">
              <i class="bx bx-search"></i>
            </div>
            <input class="form-control ps-5" type="text" placeholder="Tìm kiếm phòng ban..." />
          </div>
        </div>
        <div class="table-responsive mt-3">
          <table class="table align-middle">
            <thead class="table-secondary">
              <tr>
                <th>#</th>
                <th>Mã phòng ban</th>
                <th>Tên phòng ban</th>
                <th>Số nhân viên</th>
                <th>Trưởng phòng</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>PB001</td>
                <td>Phòng Kỹ thuật</td>
                <td>15</td>
                <td>Nguyễn Văn A</td>
                <td>Phụ trách các vấn đề kỹ thuật</td>
                <td>
                  <div class="d-flex align-items-center gap-3 fs-6">
                    <a href="javascript:;" class="text-primary" data-bs-toggle="tooltip" data-bs-placement="bottom"
                      title="" data-bs-original-title="Xem chi tiết" aria-label="Views"><i
                        class="bi bi-eye-fill"></i></a>
                    <a href="javascript:;" class="text-warning" data-bs-toggle="tooltip" data-bs-placement="bottom"
                      title="" data-bs-original-title="Chỉnh sửa" aria-label="Edit"><i
                        class="bi bi-pencil-fill"></i></a>
                    <a href="javascript:;" class="text-danger" data-bs-toggle="tooltip" data-bs-placement="bottom"
                      title="" data-bs-original-title="Xóa" aria-label="Delete"><i class="bi bi-trash-fill"></i></a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>PB002</td>
                <td>Phòng Nhân sự</td>
                <td>8</td>
                <td>Trần Thị B</td>
                <td>Quản lý nhân sự công ty</td>
                <td>
                  <div class="d-flex align-items-center gap-3 fs-6">
                    <a href="javascript:;" class="text-primary" data-bs-toggle="tooltip" data-bs-placement="bottom"
                      title="" data-bs-original-title="Xem chi tiết" aria-label="Views"><i
                        class="bi bi-eye-fill"></i></a>
                    <a href="javascript:;" class="text-warning" data-bs-toggle="tooltip" data-bs-placement="bottom"
                      title="" data-bs-original-title="Chỉnh sửa" aria-label="Edit"><i
                        class="bi bi-pencil-fill"></i></a>
                    <a href="javascript:;" class="text-danger" data-bs-toggle="tooltip" data-bs-placement="bottom"
                      title="" data-bs-original-title="Xóa" aria-label="Delete"><i class="bi bi-trash-fill"></i></a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhongBan',
  data() {
    return {
      // Dữ liệu của component
    };
  },
  methods: {
    // Các phương thức của component
  }
};
</script>

<style scoped>
/* CSS cho component */
</style>