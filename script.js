let isBusy = false;
// FIX 1: Khởi tạo biến lưu trữ đáp án
let sheetAnswers = {}; 

// Hàm chọn nhiệm vụ tổng quát
function selectMission(element, px, py, targetScale, themeType, imagePath, playerId = 'p1') {
    if (isBusy) return;
    isBusy = true;

    document.querySelectorAll(`#screen-${playerId === 'p1' ? 'player1' : 'player2'} .mission-card`).forEach(card => {
        card.classList.remove('selected-primary', 'selected-secondary');
    });

    element.classList.add(`selected-${themeType}`);
    flyTo(px, py, targetScale, playerId);

    if (imagePath) {
        updateMapImage(imagePath, playerId);
    }

    setTimeout(() => { isBusy = false; }, 500);
}

// Hàm cập nhật ảnh có fade-in
function updateMapImage(newPath, playerId) {
    const mapImg = document.getElementById(`map-image-${playerId}`);
    const miniMapImg = document.getElementById(`minimap-image-${playerId}`);
    
    if (!mapImg) return;

    const img = new Image();
    mapImg.style.opacity = '0.3';

    img.onload = () => {
        mapImg.src = newPath;
        if (miniMapImg) miniMapImg.src = newPath;
        mapImg.style.opacity = '1';
    };
    img.src = newPath;
}

// Hàm chấm điểm thông minh
function checkScore(playerId) {
    const inputs = document.querySelectorAll(`select[id$="-${playerId}"]`);
    
    // Debug: Kiểm tra xem code có quét được ô select nào không
    console.log(`[Player ${playerId}] Số lượng ô select tìm thấy:`, inputs.length);
    
    if (inputs.length === 0) {
        console.warn('Không tìm thấy ô nhập liệu nào! Vui lòng kiểm tra lại ID trong HTML.');
        return false;
    }

    let allCorrect = true;

    inputs.forEach(input => {
        const baseId = input.id.split('-')[0];
        const userAnswer = String(input.value).trim();
        const correctAnswer = sheetAnswers[baseId];

        // Debug: Theo dõi đáp án người chơi nhập vs đáp án đúng
        console.log(`Câu [${baseId}] - Người chơi chọn: "${userAnswer}" | Đáp án đúng: "${correctAnswer}"`);

        // Nếu có đáp án và người chơi trả lời sai
        if (correctAnswer && userAnswer !== correctAnswer) {
            allCorrect = false;
        }
        
        // Cảnh báo nếu chưa có giá trị nhập
        if (userAnswer === "") {
            allCorrect = false;
        }
    });

    return allCorrect;
}

// ==========================================
// KHỞI TẠO DỮ LIỆU & GIAO DIỆN
// ==========================================
async function fetchGameData() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbylPtqKRBFW6XDE09Fv-3JUjG_wIvxc4dbJyBGmub5gVUB0WnmhOkYIGvJ0trp-7pel/exec");
        const data = await response.json();
        
        data.forEach(item => {
            if(item.QuestionID && item.CorrectAnswer) {
                sheetAnswers[item.QuestionID] = String(item.CorrectAnswer).trim(); 
            }
        });
        
        console.log("Đáp án đã tải:", sheetAnswers); // Debug xem đáp án tải về thành công chưa
        renderMissions(data);
    } catch (error) {
        console.error("Lỗi khi kết nối với Google Sheet:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Logic nút Submit cho từng Player
// Logic nút Submit cho từng Player
['p1', 'p2'].forEach(playerId => {
    const submitBtn = document.getElementById(`btn-submit-${playerId}`);
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            console.log(`--- Đang kiểm tra kết quả cho ${playerId} ---`);
            
            if (checkScore(playerId)) {
                // 1. Tùy chọn: Có thể giữ hoặc bỏ thông báo này
                // alert(`Chúc mừng ${playerId.toUpperCase()} đã giải mã thành công!`);

                // 2. Ẩn màn hình của người chơi hiện tại
                const playerScreenId = playerId === 'p1' ? 'screen-player1' : 'screen-player2';
                const playerScreen = document.getElementById(playerScreenId);
                if (playerScreen) {
                    playerScreen.style.display = 'none';
                }

                // 3. Hiện màn hình Victory
                const victoryScreen = document.getElementById('screen-victory');
                if (victoryScreen) {
                    // Dùng 'flex' thay vì 'block' để giữ đúng layout class="flex flex-col..." của bạn
                    victoryScreen.style.display = 'flex'; 
                }

            } else {
                alert('Chưa chính xác đâu! Kiểm tra lại nhé!');
            }
        });
    } else {
        console.warn(`Không tìm thấy nút Submit cho ${playerId} (ID: btn-submit-${playerId})`);
    }
});

    // Các nút chuyển màn hình
    document.getElementById('btn-start-p1')?.addEventListener('click', () => {
        document.getElementById('screen-main').style.display = 'none';
        document.getElementById('screen-player1').style.display = 'flex';
    });
    
    document.getElementById('btn-start-p2')?.addEventListener('click', () => {
        document.getElementById('screen-main').style.display = 'none';
        document.getElementById('screen-player2').style.display = 'flex';
    });

    const replayBtn = document.getElementById('btn-replay');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            document.getElementById('screen-victory').style.display = 'none';
            document.getElementById('screen-main').style.display = 'flex';
            
            document.querySelectorAll('select').forEach(select => {
                select.value = "";
            });

            if (typeof resetMap === "function") {
                resetMap();
            }
        });
    }
});