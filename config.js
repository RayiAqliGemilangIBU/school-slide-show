/**
 * ============================================================================
 * KONFIGURASI SISTEM INFORMASI TV SEKOLAH (HIDDEN CONFIG)
 * Richmond Park International Secondary School Sarajevo
 * ============================================================================
 */

window.SCHOOL_CONFIG = {
  // --------------------------------------------------------------------------
  // FITUR TERSEMBUNYI (HIDDEN FEATURE): JADWAL JUMAT WINTER / SUMMER
  // Ubah nilai di bawah ini menjadi "winter" atau "summer"
  // - "winter" : Menggunakan jadwal friday_winter dari bell_schedule.json (Pulang 15:10)
  // - "summer" : Menggunakan jadwal friday_summer dari bell_schedule.json (Pulang 15:20)
  // --------------------------------------------------------------------------
  FRIDAY_SEASON: "winter", // Pilihan: "winter" | "summer"

  // --------------------------------------------------------------------------
  // PENGATURAN DURASI SLIDESHOW (DALAM DETIK)
  // Dirancang agar seluruh 12 kelas selesai ditampilkan dalam < 2 menit
  // sehingga siswa dapat melihat seluruh kelas saat waktu istirahat (3-5 menit).
  // --------------------------------------------------------------------------
  CLASS_SLIDE_DURATION_SECONDS: 8,       // Durasi per slide kelas saat jam pelajaran (8 detik x 12 kelas = 96 detik)
  CLASS_SLIDE_BREAK_DURATION_SECONDS: 6, // Durasi per slide kelas saat waktu istirahat/break (6 detik x 12 kelas = 72 detik)
  IMAGE_MEDIA_DURATION_SECONDS: 8,       // Durasi tampil untuk setiap gambar di folder media/
  VIDEO_MAX_DURATION_SECONDS: 180,       // Batas waktu maksimum keamanan untuk video (video akan lanjut otomatis saat selesai)

  // --------------------------------------------------------------------------
  // PENGATURAN JAM OPERASIONAL SEKOLAH
  // Sebelum SCHOOL_MORNING_START_TIME atau setelah jam pelajaran terakhir selesai,
  // layar TV otomatis hanya akan memutar slideshow media (gambar/video).
  // --------------------------------------------------------------------------
  SCHOOL_MORNING_START_TIME: "07:30",    // Mulai menampilkan jadwal pelajaran pagi hari

  // --------------------------------------------------------------------------
  // FITUR TERSEMBUNYI: EDITOR JADWAL (TOMBOL RAHASIA)
  // Buka dengan: klik logo "RPS" di kiri atas 5x dengan cepat, ATAU Ctrl+Shift+E.
  // Isi PIN (contoh: "1234") agar editor meminta PIN. Kosongkan "" = tanpa PIN.
  // --------------------------------------------------------------------------
  EDITOR_PIN: "",

  // Lokasi file JSON (di dalam folder data/)
  PATHS: {
    TIMETABLE_JSON: "data/timetable.json",
    BELL_SCHEDULE_JSON: "data/bell_schedule.json",
    MEDIA_JSON: "data/media.json"
  }
};
