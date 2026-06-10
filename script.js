// ==========================================
// 1. KHỞI TẠO BIẾN TOÀN CỤC
// ==========================================
let isBusy = false;
// FIX 1: Khởi tạo biến lưu trữ đáp án
let sheetAnswers = {}; 

// THÊM MỚI: Biến lưu trữ trạng thái map cho cả 2 người chơi
let mapStates = {
    p1: { scale: 0.308248, x: 141.987, y: 0 },
    p2: { scale: 0.308248, x: 141.987, y: 0 } // Giả sử p2 cũng có thông số ban đầu giống p1
};

// ==========================================
// 2. CÁC HÀM XỬ LÝ MAP (ZOOM & PAN)
// ==========================================
// Hàm xử lý phóng to / thu nhỏ (Hỗ trợ p1 & p2)
function zoomMap(delta, playerId = 'p1') {
    const mapContent = document.getElementById(`map-content-${playerId}`);
    if (!mapContent) return;

    mapStates[playerId].scale += delta;
    
    // Giới hạn zoom
    if (mapStates[playerId].scale < 0.1) mapStates[playerId].scale = 0.1; 
    if (mapStates[playerId].scale > 3.0) mapStates[playerId].scale = 3.0;

    updateMapTransform(playerId);
}

// Hàm xử lý reset bản đồ (Hỗ trợ p1 & p2)
function resetMap(playerId = 'p1') {
    const mapContent = document.getElementById(`map-content-${playerId}`);
    if (!mapContent) return;

    mapStates[playerId].scale = 0.308248;
    mapStates[playerId].x = 141.987;
    mapStates[playerId].y = 0;
    
    updateMapTransform(playerId);
}

// Hàm áp dụng CSS transform
function updateMapTransform(playerId = 'p1') {
    const mapContent = document.getElementById(`map-content-${playerId}`);
    if (mapContent) {
        mapContent.style.transform = `translate(${mapStates[playerId].x}px, ${mapStates[playerId].y}px) scale(${mapStates[playerId].scale})`;
    }
}

let isDragging = false;
let startX, startY;

function setupMapInteractions(playerId) {
    const viewport = document.getElementById(`map-viewport-${playerId}`);
    const content = document.getElementById(`map-content-${playerId}`);

    if (!viewport || !content) return;

    // 1. Lăn chuột để Zoom (Scroll to Zoom)
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault(); 
        const zoomAmount = e.deltaY < 0 ? 0.05 : -0.05;
        zoomMap(zoomAmount, playerId);
    });

    // 2. Nhấn chuột để bắt đầu kéo (Drag Start)
    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - mapStates[playerId].x;
        startY = e.clientY - mapStates[playerId].y;
        
        viewport.style.cursor = 'grabbing';
        content.style.transition = 'none'; 
    });

    // 3. Kéo chuột để di chuyển (Dragging)
    viewport.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        mapStates[playerId].x = e.clientX - startX;
        mapStates[playerId].y = e.clientY - startY;

        updateMapTransform(playerId);
    });

    // 4. Thả chuột ra để kết thúc kéo (Drag End/Leave)
    const stopDragging = () => {
        if (!isDragging) return;
        isDragging = false;
        
        viewport.style.cursor = 'grab';
        content.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    };

    viewport.addEventListener('mouseup', stopDragging);
    viewport.addEventListener('mouseleave', stopDragging);
}

// ==========================================
// 3. CÁC HÀM XỬ LÝ LOGIC GAME
// ==========================================
// Hàm chọn nhiệm vụ tổng quát
function selectMission(element, px, py, targetScale, themeType, imagePath, playerId = 'p1') {
    if (isBusy) return;
    isBusy = true;

    document.querySelectorAll(`#screen-${playerId === 'p1' ? 'player1' : 'player2'} .mission-card`).forEach(card => {
        card.classList.remove('selected-primary', 'selected-secondary');
    });

    element.classList.add(`selected-${themeType}`);
    // Giả sử hàm flyTo của bạn sẽ cập nhật lại biến mapStates, nếu không có thể tạm thời để nguyên
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

// Hàm chấm điểm thông minh (Đã nâng cấp Debug)
function checkScore(playerId) {
    const inputs = document.querySelectorAll(`select[id$="-${playerId}"]`);
    
    console.log(`[Player ${playerId}] Số lượng ô select tìm thấy:`, inputs.length);
    
    if (inputs.length === 0) {
        console.warn('Không tìm thấy ô nhập liệu nào! Vui lòng kiểm tra lại ID trong HTML.');
        return { allCorrect: false, wrongList: [] }; // Trả về object thay vì boolean
    }

    let allCorrect = true;
    let wrongList = []; // Mảng lưu các câu trả lời sai hoặc chưa điền

    inputs.forEach(input => {
        // Lấy ID câu hỏi và dọn dẹp khoảng trắng
        const baseId = input.id.split('-')[0].trim(); 
        
        // Lấy đáp án của người chơi (chuyển sang in hoa để dễ so sánh)
        const userAnswer = String(input.value).trim().toUpperCase(); 
        
        // Lấy đáp án từ Sheet (cũng chuyển sang in hoa)
        const rawCorrectAnswer = sheetAnswers[baseId];
        const correctAnswer = rawCorrectAnswer ? rawCorrectAnswer.toUpperCase() : undefined;

        console.log(`Câu [${baseId}] - Người chơi chọn: "${userAnswer}" | Đáp án đúng: "${correctAnswer}"`);

        // Check 1: Chưa chọn đáp án
        if (userAnswer === "") {
            allCorrect = false;
            wrongList.push(`${baseId} (Chưa điền)`);
        } 
        // Check 2: Đáp án sai
        else if (correctAnswer && userAnswer !== correctAnswer) {
            allCorrect = false;
            wrongList.push(baseId);
        }
        // Check 3: HTML có câu này nhưng trên Sheet không có đáp án
        else if (!correctAnswer) {
            console.warn(`Lỗi Dữ Liệu: Không tìm thấy đáp án cho câu [${baseId}] trong sheet!`);
            allCorrect = false;
            wrongList.push(`${baseId} (Lỗi dữ liệu Sheet)`);
        }
    });

    // Trả về cả trạng thái đúng/sai và danh sách câu sai
    return { allCorrect: allCorrect, wrongList: wrongList }; 
}


// ==========================================
// 4. KHỞI TẠO DỮ LIỆU & GIAO DIỆN (EVENTS)
// ==========================================
async function fetchGameData() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbylPtqKRBFW6XDE09Fv-3JUjG_wIvxc4dbJyBGmub5gVUB0WnmhOkYIGvJ0trp-7pel/exec");
        const data = await response.json();
        
        data.forEach(item => {
            if(item.QuestionID && item.CorrectAnswer) {
                // Ép kiểu và xóa khoảng trắng cho cả ID lẫn Đáp án
                const cleanId = String(item.QuestionID).trim();
                sheetAnswers[cleanId] = String(item.CorrectAnswer).trim(); 
            }
        });
        
        console.log("Đáp án đã tải thành công:", sheetAnswers);
        renderMissions(data);
    } catch (error) {
        console.error("Lỗi khi kết nối với Google Sheet:", error);
    }
}
// Hàm tạo danh sách nhiệm vụ từ Google Sheet
function renderMissions(data) {
    // Tìm thẻ chứa danh sách nhiệm vụ của 2 người chơi (nhớ thay ID bằng ID thật trong HTML của bạn)
    const containerP1 = document.getElementById('mission-container-p1'); 
    const containerP2 = document.getElementById('mission-container-p2');

    // Xoá dữ liệu cũ nếu có
    if (containerP1) containerP1.innerHTML = '';
    if (containerP2) containerP2.innerHTML = '';

    data.forEach(item => {
        // Bỏ qua nếu dòng trống không có mã câu hỏi QuestionID 
        if (!item.QuestionID) return;

        // Chuyển đổi dữ liệu tọa độ MapX, MapY, MapZoom sang số thực 
        const mapX = parseFloat(item.MapX) || 0;
        const mapY = parseFloat(item.MapY) || 0;
        const mapZoom = parseFloat(item.MapZoom) || 1;

        // 1. Tạo thẻ nhiệm vụ cho Player 1
        if (containerP1) {
            const cardP1 = document.createElement('div');
            // Thay class bằng các class Tailwind bạn đang dùng
            cardP1.className = 'mission-card p-4 bg-surface/40 rounded-xl cursor-pointer mb-2 border-2 border-transparent hover:border-primary/50';
            
            // Sử dụng Label từ sheet làm tên nhiệm vụ 
            cardP1.innerHTML = `<h3 class="font-bold text-lg">${item.Label}</h3>`;
            
            // Khi click, truyền đúng tọa độ và ảnh ImagePath-p1 của P1 
            cardP1.onclick = function() {
                // Lưu ý: Tên cột có dấu gạch ngang nên phải dùng ngoặc vuông item['ImagePath-p1'] 
                selectMission(this, mapX, mapY, mapZoom, 'primary', item['ImagePath-p1'], 'p1');
            };
            containerP1.appendChild(cardP1);
        }

        // 2. Tạo thẻ nhiệm vụ cho Player 2
        if (containerP2) {
            const cardP2 = document.createElement('div');
            cardP2.className = 'mission-card p-4 bg-surface/40 rounded-xl cursor-pointer mb-2 border-2 border-transparent hover:border-secondary/50';
            
            // Sử dụng Label từ sheet làm tên nhiệm vụ 
            cardP2.innerHTML = `<h3 class="font-bold text-lg">${item.Label}</h3>`;
            
            // Khi click, truyền đúng tọa độ và ảnh ImagePath-p2 của P2 
            cardP2.onclick = function() {
                selectMission(this, mapX, mapY, mapZoom, 'secondary', item['ImagePath-p2'], 'p2');
            };
            containerP2.appendChild(cardP2);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchGameData();

    setupMapInteractions('p1');
    setupMapInteractions('p2');
    // Logic nút Submit cho từng Player
    ['p1', 'p2'].forEach(playerId => {
        const submitBtn = document.getElementById(`btn-submit-${playerId}`);
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                console.log(`--- Đang kiểm tra kết quả cho ${playerId} ---`);
                
                // Hứng object kết quả từ hàm checkScore
                const result = checkScore(playerId); 
                
                if (result.allCorrect) {
                    const playerScreenId = playerId === 'p1' ? 'screen-player1' : 'screen-player2';
                    const playerScreen = document.getElementById(playerScreenId);
                    if (playerScreen) {
                        playerScreen.style.display = 'none';
                    }

                    const victoryScreen = document.getElementById('screen-victory');
                    if (victoryScreen) {
                        victoryScreen.style.display = 'flex'; 
                    }

                } else {
                    // Hiện danh sách các câu sai lên Alert
                    alert(`Chưa chính xác đâu! Kiểm tra lại các câu này nhé:\n👉 ${result.wrongList.join(', ')}`);
                }
            });
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

    // Nút chơi lại
    const replayBtn = document.getElementById('btn-replay');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            document.getElementById('screen-victory').style.display = 'none';
            document.getElementById('screen-main').style.display = 'flex';
            
            document.querySelectorAll('select').forEach(select => {
                select.value = "";
            });

            // Reset map cho cả 2 người chơi khi bấm Replay
            resetMap('p1');
            resetMap('p2');
        });
    }
});