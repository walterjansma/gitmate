class Animation {

    animation : NodeJS.Timeout | undefined;

    showAnimation() {
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;

    this.animation = setInterval(() => {
        process.stdout.write(`\r${frames[i]} Processing your git command...`);
        i = (i + 1) % frames.length;
    }, 80);
    }

    stopAnimation() {
        clearInterval(this.animation);
    }
}

export default Animation;