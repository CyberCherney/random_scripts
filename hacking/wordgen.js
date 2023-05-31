

for (let i = 0; i < 34; i++) {
    temp = i + 1;
    console.log("## Level " + i);
    console.log("___");
    console.log("Solution: ```  ```");
    console.log("Password: ");
    console.log("\`\`\`ssh bandit" + temp + "@bandit.labs.overthewire.org -p 2220\`\`\`");
    console.log("___");
}