// ==========================================
// PHẦN 1: TẢI DỮ LIỆU TỪ GOOGLE SHEET
// ==========================================
const sheetURL = "https://script.google.com/macros/s/AKfycbylPtqKRBFW6XDE09Fv-3JUjG_wIvxc4dbJyBGmub5gVUB0WnmhOkYIGvJ0trp-7pel/exec";

// Tạo một biến toàn cục để lưu bộ đáp án đúng từ Sheet
let sheetAnswers = {}; 

async function fetchGameData() {
    try {
        const response = await fetch(sheetURL);
        const data = await response.json();
        
        // Cất đáp án từ Sheet vào biến sheetAnswers để lát nữa đem ra chấm điểm
        data.forEach(item => {
            if(item.QuestionID && item.CorrectAnswer) {
                // Lấy ID làm chìa khóa, Đáp án làm giá trị (có trim() để xóa dấu cách thừa nếu lỡ gõ sai trong Sheet)
                sheetAnswers[item.QuestionID] = String(item.CorrectAnswer).trim(); 
            }
        });

        renderMissions(data);
    } catch (error) {
        console.error("Lỗi khi kết nối với Google Sheet:", error);
    }
}

function renderMissions(data) {
    const container = document.getElementById('mission-scroll');
    if (!container) return;

    container.innerHTML = ''; 

    data.forEach(item => {
        const cardHTML = `
        <div class="mission-card cursor-pointer transition-all duration-300 min-w-[320px] bg-primary-fixed/80 backdrop-blur-md rounded-lg p-4 border border-white/60 shadow-[0_4px_16px_rgba(180,21,71,0.1)] relative group h-full flex flex-col justify-between max-h-none py-6" 
             onclick="selectMission(this, ${item.MapX}, ${item.MapY}, ${parseFloat(item.MapZoom) || 2.5}, 'primary', '${item.ImagePath}')">
            <div class="candy-gloss"></div>
            <p class="font-body-md text-on-surface mb-3 relative z-10 leading-relaxed text-[17px] pointer-events-none">
                ${item.MissionText}
            </p>
            <div class="flex flex-col gap-2 relative z-10 pointer-events-none">
                <div class="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center w-max shadow-sm border border-white">
                    <span class="material-symbols-outlined text-primary mr-1 text-sm">my_location</span>
                    <span class="font-label-sm text-label-sm text-primary uppercase">Target: ${item.TargetName}</span>
                </div>
            </div>
        </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

fetchGameData();


// ==========================================
// PHẦN 2: LOGIC GIAO DIỆN & CHẤM ĐIỂM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // 1. Chuyển màn hình
    const btnStartP1 = document.getElementById('btn-start-p1');
    const btnStartP2 = document.getElementById('btn-start-p2');
    
    if(btnStartP1) {
        btnStartP1.addEventListener('click', () => {
            document.getElementById('screen-main').style.display = 'none';
            document.getElementById('screen-player1').style.display = 'flex';
        });
    }

    if(btnStartP2) {
        btnStartP2.addEventListener('click', () => {
            document.getElementById('screen-main').style.display = 'none';
            document.getElementById('screen-player2').style.display = 'flex';
        });
    }

    // 2. Logic Nút SUBMIT (Đã cập nhật tính năng dò đáp án tự động)
    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            console.log("Nút Submit đã được nhấn!"); 
            
            const a16 = document.getElementById('q16')?.value;
            const a17 = document.getElementById('q17')?.value;
            const a18 = document.getElementById('q18')?.value;
            const a19 = document.getElementById('q19')?.value;
            const a20 = document.getElementById('q20')?.value;

            // KIỂM TRA ĐÁP ÁN ĐỘNG TỪ GOOGLE SHEET
            if (a16 === sheetAnswers['q16'] && 
                a17 === sheetAnswers['q17'] && 
                a18 === sheetAnswers['q18'] && 
                a19 === sheetAnswers['q19'] && 
                a20 === sheetAnswers['q20']) {
                
                document.getElementById('screen-player2').style.display = 'none';
                document.getElementById('screen-victory').style.display = 'flex';
            } else {
                alert('Chưa chính xác đâu! Kiểm tra lại các vị trí trên bản đồ nhé!');
            }
        });
    }

    // 3. Nút PLAY AGAIN
    const replayBtn = document.getElementById('btn-replay');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            document.getElementById('screen-victory').style.display = 'none';
            document.getElementById('screen-main').style.display = 'flex';
            document.querySelectorAll('select').forEach(select => select.value = "");
        });
    }
});