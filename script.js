// Heart button functionality (original confession code)
$("#messageState").on("change", (x) => {
    $(".message").removeClass("openNor").removeClass("closeNor");
    if ($("#messageState").is(":checked")) {
        $(".message").removeClass("closed").removeClass("no-anim").addClass("openNor");
        $(".heart").removeClass("closeHer").removeClass("openedHer").addClass("openHer");
        $(".confession-container").stop().animate({"backgroundColor": "#f48fb1"}, 2000);
        console.log("Opening message");
    } else {
        $(".message").removeClass("no-anim").addClass("closeNor");
        $(".heart").removeClass("openHer").removeClass("openedHer").addClass("closeHer");
        $(".confession-container").stop().animate({"backgroundColor": "#fce4ec"}, 2000);
        console.log("Closing message");
    }
});

$(".message").on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
    console.log("Animation End");
    if ($(".message").hasClass("closeNor"))
        $(".message").addClass("closed");
    $(".message").removeClass("openNor").removeClass("closeNor").addClass("no-anim");
});

$(".heart").on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
    console.log("Animation End");
    if (!$(".heart").hasClass("closeHer"))
        $(".heart").addClass("openedHer").addClass("beating");
    else
        $(".heart").addClass("no-anim").removeClass("beating");
    $(".heart").removeClass("openHer").removeClass("closeHer");
});

// Normal button functionality (does nothing for now)
$(".btn-signing").on("click", function() {
    console.log("Normal button clicked - currently does nothing");
    // You can add functionality here later
});

// Music control
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('bgMusic');
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    // Try to autoplay
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            playBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
        })
        .catch(error => {
            console.log('Autoplay prevented:', error);
        });
    }
    
    playBtn.addEventListener('click', function() {
        audio.play();
        playBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
    });
    
    stopBtn.addEventListener('click', function() {
        audio.pause();
        audio.currentTime = 0;
        stopBtn.classList.add('hidden');
        playBtn.classList.remove('hidden');
    });
});