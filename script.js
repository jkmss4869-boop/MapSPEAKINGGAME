// 1. Chuyển màn hình (Dùng chung cho các nút Start)
document.getElementById('btn-start-p1').addEventListener('click', () => {
    document.getElementById('screen-main').style.display = 'none';
    document.getElementById('screen-player1').style.display = 'flex';
});

document.getElementById('btn-start-p2').addEventListener('click', () => {
    document.getElementById('screen-main').style.display = 'none';
    document.getElementById('screen-player2').style.display = 'flex';
});

// 2. Logic Nút SUBMIT
// Đảm bảo code chạy sau khi trang web đã load xong
document.addEventListener('DOMContentLoaded', () => {

    const submitBtn = document.getElementById('btn-submit');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            console.log("Nút Submit đã được nhấn!"); // Mở F12 trên trình duyệt để thấy dòng này
            
            // Lấy giá trị các ô select (ID là q16, q17, q18, q19, q20)
            const a16 = document.getElementById('q16')?.value;
            const a17 = document.getElementById('q17')?.value;
            const a18 = document.getElementById('q18')?.value;
            const a19 = document.getElementById('q19')?.value;
            const a20 = document.getElementById('q20')?.value;

            // Kiểm tra đáp án chuẩn từ kịch bản
if (a16 === 'G' && a17 === 'C' && a18 === 'B' && a19 === 'D' && a20 === 'A') {
    document.getElementById('screen-player2').style.display = 'none';
    document.getElementById('screen-victory').style.display = 'flex';
} else {
    alert('Chưa chính xác đâu! Kiểm tra lại các vị trí: Farm shop, Entry, Playground, Gardens và Temple nhé!');
}
        });
    }
    // Nút PLAY AGAIN để reset game
const replayBtn = document.getElementById('btn-replay');
if (replayBtn) {
    replayBtn.addEventListener('click', () => {
        // 1. Giấu màn hình Victory
        document.getElementById('screen-victory').style.display = 'none';
        
        // 2. Hiện lại màn hình chính
        document.getElementById('screen-main').style.display = 'flex';
        
        // 3. (Tùy chọn) Reset các ô chọn đáp án về trạng thái ban đầu
        document.querySelectorAll('select').forEach(select => select.value = "");
    });
}
});