function escapeToAscii(str) {
    return str.split('').map(char => "\\" + char.charCodeAt(0)).join('');
}

function extractLinks(input) {
    const regex = /loadstring\(game:HttpGet\("([^"]+)"\)\)/g;
    const links = [];
    let match;
    while ((match = regex.exec(input)) !== null) {
        links.push(match[1]);
    }
    return links;
}

function obfuscate() {
    const input = document.getElementById('inputText').value.trim();
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    output.value = "";
    status.textContent = "Processing...";

    setTimeout(() => {
        if (!input) {
            status.textContent = "Error: No input provided";
            return;
        }

        try {
            const links = extractLinks(input);
            
            if (links.length === 0) {
                // Handle regular code (not containing loadstring patterns)
                const escaped = escapeToAscii(input);
                const result = `local a = getfenv and getfenv() or _ENV\n` +
                    `local b = a["loadstring"]\n` +
                    `local c = a["game"]["HttpGet"]\n` +
                    `local d = a["game"]\n\n` +
                    `local u = "${escaped}"\n\n` +
                    `b(c(d, u))()`;
                output.value = result;
                status.textContent = "Conversion complete! (Single code)";
                return;
            }

            let variables = "";
            let execution = "";
            
            links.forEach((link, index) => {
                const varName = `u${index + 1}`;
                variables += `local ${varName} = "${escapeToAscii(link)}"\n`;
                execution += `b(c(d, ${varName}))()\n`;
            });

            const result = `local a = getfenv and getfenv() or _ENV\n` +
                `local b = a["loadstring"]\n` +
                `local c = a["game"]["HttpGet"]\n` +
                `local d = a["game"]\n\n` +
                `${variables}\n` +
                `${execution}`;

            output.value = result;
            status.textContent = `Conversion complete! (${links.length} links detected)`;
        } catch (error) {
            status.textContent = "Error: Invalid input";
            console.error(error);
        }
    }, 300);
}

function base64EncodeUnicode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function base64Obfuscate() {
    const input = document.getElementById('inputText').value;
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    output.value = "";
    status.textContent = "Processing...";

    setTimeout(() => {
        if (!input) {
            status.textContent = "Error: No input provided";
            return;
        }

        try {
            const links = extractLinks(input);
            let b64Strings = [];
            
            if (links.length === 0) {
                // Handle regular code (not containing loadstring patterns)
                const b64 = base64EncodeUnicode(input);
                const luaBase64DecodeFunction = `
local b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
local function decodeBase64(data)
    data = string.gsub(data, '[^'..b..'=]', '')
    return (data:gsub('.', function(x)
        if (x == '=') then return '' end
        local r,f='',(b:find(x)-1)
        for i=6,1,-1 do r=r..(f%2^i - f%2^(i-1) > 0 and '1' or '0') end
        return r;
    end):gsub('%d%d%d%d%d%d%d%d', function(x)
        local c=0
        for i=1,8 do c=c + (x:sub(i,i) == '1' and 2^(8-i) or 0) end
        return string.char(c)
    end))
end
`;

                const luaScript = `${luaBase64DecodeFunction}

local b64string = "${b64}"

local decoded = decodeBase64(b64string)

local f = loadstring or load
f(decoded)()
`;
                output.value = luaScript.trim();
                status.textContent = "Obfuscation complete! (Single code)";
                return;
            }

            // Handle multiple links
            let variables = "";
            let execution = "";
            
            links.forEach((link, index) => {
                const b64 = base64EncodeUnicode(`loadstring(game:HttpGet("${link}"))()`);
                const varName = `b64string${index + 1}`;
                variables += `local ${varName} = "${b64}"\n`;
                execution += `local decoded${index + 1} = decodeBase64(${varName})\n` +
                             `f(decoded${index + 1})()\n`;
            });

            const luaBase64DecodeFunction = `
local b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
local function decodeBase64(data)
    data = string.gsub(data, '[^'..b..'=]', '')
    return (data:gsub('.', function(x)
        if (x == '=') then return '' end
        local r,f='',(b:find(x)-1)
        for i=6,1,-1 do r=r..(f%2^i - f%2^(i-1) > 0 and '1' or '0') end
        return r;
    end):gsub('%d%d%d%d%d%d%d%d', function(x)
        local c=0
        for i=1,8 do c=c + (x:sub(i,i) == '1' and 2^(8-i) or 0) end
        return string.char(c)
    end))
end
`;

            const luaScript = `${luaBase64DecodeFunction}

${variables}

local f = loadstring or load
${execution}
`;

            output.value = luaScript.trim();
            status.textContent = `Obfuscation complete! (${links.length} links detected)`;
        } catch (error) {
            status.textContent = "Error: Invalid input";
            console.error(error);
        }
    }, 300);
}

// Add click animation to all buttons
document.querySelectorAll('button, .social-button').forEach(button => {
    button.addEventListener('click', function() {
        this.style.transform = 'translateY(1px)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
});
