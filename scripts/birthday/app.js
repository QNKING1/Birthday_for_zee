        const CONFIG = {
            GLITCH_PROBABILITY: 0.3,
            SCAN_DURATION: 3000, // 3 seconds scan
            DECRYPTION_DURATION: 8000, // 8 seconds decryption
            NEURAL_DURATION: 10000 // 10 seconds neural
        };

        const TERMINAL_MESSAGES = [
            '> Initializing secure access protocol...',
            '> Establishing encrypted connection...',
            '> Accessing secure database...',
            '> Decrypting credentials...',
            '> Verifying biometric authentication...',
            '> Biometric authentication required',
        ];

        const elements = {
            terminalSection: document.getElementById('terminal-section'),
            terminalOutput: document.getElementById('terminal-output'),
            scannerSection: document.getElementById('scanner-section'),
            scanner: document.getElementById('fingerprintScanner'),
            statusLabel: document.getElementById('status-label'),
            welcomeMessage: document.getElementById('welcome-message'),
            hintText: document.getElementById('hint-text'),
            decryptionSection: document.getElementById('decryption-section'),
            hexMatrix: document.getElementById('hex-matrix'),
            progressBar: document.getElementById('progress-bar'),
            progressText: document.getElementById('progress-text'),
            statusMessage: document.getElementById('status-message'),
            firewallNodes: [
                document.getElementById('firewall1'),
                document.getElementById('firewall2'),
                document.getElementById('firewall3'),
                document.getElementById('firewall4'),
                document.getElementById('firewall5')
            ],
            neuralSection: document.getElementById('neural-section'),
            neuralCanvas: document.getElementById('neuralCanvas'),
            neuralTitle: document.getElementById('neural-title'),
            identityConfirmed: document.getElementById('identity-confirmed'),
            nameDisplay: document.getElementById('name-display'),
            flashOverlay: document.getElementById('flash-overlay')
        };

        let scanCount = 0;
        let isScanning = false;
        let isProcessing = false;
        let scanStartTime = null;
        let animationFrame = null;

        // Hex Matrix Variables
        let hexMatrixCtx;
        let hexChars = "0123456789ABCDEF";
        let hexColumns = [];
        let hexMatrixWidth, hexMatrixHeight;

        // Neural Variables
        let neuralScene, neuralCamera, neuralRenderer;
        let neuralParticles = [];
        let neuralConnections = [];
        let particleCount = 1500;
        let neuralPhase = 0;
        let targetPositions = [];

        function displayTerminalSequence() {
            elements.terminalOutput.innerHTML = '';
            let messageIndex = 0;
            let charIndex = 0;
            let currentLine = '';

            function typeNextCharacter() {
                if (messageIndex >= TERMINAL_MESSAGES.length) {
                    setTimeout(() => {
                        elements.terminalSection.style.opacity = '0';
                        setTimeout(() => {
                            elements.terminalSection.style.display = 'none';
                            initFingerprint();
                        }, 1000);
                    }, 1000);
                    return;
                }

                const message = TERMINAL_MESSAGES[messageIndex];

                if (charIndex < message.length) {
                    currentLine += message[charIndex];
                    charIndex++;

                    let lines = elements.terminalOutput.querySelectorAll('.terminal-line');
                    if (lines.length <= messageIndex) {
                        const lineEl = document.createElement('div');
                        lineEl.className = 'terminal-line';
                        lineEl.innerHTML = currentLine;
                        elements.terminalOutput.appendChild(lineEl);
                    } else {
                        lines[messageIndex].innerHTML = currentLine;
                    }

                    setTimeout(typeNextCharacter, Math.random() * 50 + 30);
                } else {
                    let lines = elements.terminalOutput.querySelectorAll('.terminal-line');
                    let lineEl = lines[messageIndex];

                    if (Math.random() < CONFIG.GLITCH_PROBABILITY) {
                        applyGlitch(lineEl);
                    }

                    messageIndex++;
                    charIndex = 0;
                    currentLine = '';
                    setTimeout(typeNextCharacter, 300);
                }
            }

            typeNextCharacter();
        }

        function applyGlitch(element) {
            const text = element.textContent;
            element.innerHTML = `<span class="glitch" data-glitch="${text}">${text}</span>`;
            setTimeout(() => {
                element.innerHTML = text;
            }, 300);
        }

        function initFingerprint() {
            elements.scannerSection.style.display = 'flex';
            setTimeout(() => {
                elements.scannerSection.style.opacity = '1';
            }, 100);

            // Add Interaction Listeners
            elements.scanner.addEventListener('mousedown', startScanning);
            elements.scanner.addEventListener('touchstart', (e) => { e.preventDefault(); startScanning(); });

            window.addEventListener('mouseup', stopScanning);
            window.addEventListener('touchend', stopScanning);
            elements.scanner.addEventListener('mouseleave', stopScanning);
        }

        function startScanning() {
            if (isScanning || isProcessing) return;
            isScanning = true;
            scanStartTime = Date.now();

            elements.scanner.classList.add('scanning');
            elements.hintText.style.opacity = '0';
            elements.statusLabel.style.display = 'none';
            elements.welcomeMessage.style.opacity = '0';

            animateScan();
        }

        function stopScanning() {
            if (!isScanning) return;
            isScanning = false;
            cancelAnimationFrame(animationFrame);
            elements.scanner.classList.remove('scanning');

            if (!isProcessing) {
                elements.hintText.style.opacity = '1';
                resetScanVisuals();
            }
        }

        function animateScan() {
            if (!isScanning) return;

            const elapsed = Date.now() - scanStartTime;
            const progress = Math.min(elapsed / CONFIG.SCAN_DURATION, 1);

            updateScanVisuals(progress * 100);

            if (progress >= 1) {
                completeScan();
            } else {
                animationFrame = requestAnimationFrame(animateScan);
            }
        }

        function updateScanVisuals(percent) {
            let styleTag = document.getElementById('dynamic-scan-style');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'dynamic-scan-style';
                document.head.appendChild(styleTag);
            }
            styleTag.textContent = `
                .scan.scanning .fingerprint::before { height: ${percent}% !important; }
                .scan.scanning .fingerprint::after { top: ${Math.min(percent, 98)}% !important; }
            `;
        }

        function resetScanVisuals() {
            const styleTag = document.getElementById('dynamic-scan-style');
            if (styleTag) {
                styleTag.textContent = `
                    .fingerprint::before { height: 0% !important; transition: height 0.3s ease-out; }
                    .fingerprint::after { top: 0% !important; transition: top 0.3s ease-out; }
                `;
                setTimeout(() => {
                    if (styleTag && !isScanning) styleTag.textContent = '';
                }, 300);
            }
        }

        function completeScan() {
            isScanning = false;
            isProcessing = true;
            cancelAnimationFrame(animationFrame);
            elements.scanner.classList.remove('scanning');

            scanCount++;

            setTimeout(() => {
                if (scanCount === 1) {
                    // First scan: Denied
                    elements.statusLabel.textContent = "Access Denied";
                    elements.statusLabel.className = 'denied';
                    elements.statusLabel.style.display = 'block';

                    setTimeout(() => {
                        isProcessing = false;
                        elements.statusLabel.style.display = 'none';
                        elements.hintText.style.opacity = '1';
                        resetScanVisuals();
                    }, 2000);
                } else {
                    // Second scan: Granted
                    elements.statusLabel.textContent = "Access Granted";
                    elements.statusLabel.className = 'granted';
                    elements.statusLabel.style.display = 'block';

                    setTimeout(() => {
                        elements.welcomeMessage.style.opacity = '1';
                        // Trigger decryption after showing welcome
                        setTimeout(() => {
                            startDecryptionSequence();
                        }, 1500);
                    }, 500);
                }
            }, 500);
        }

        function startDecryptionSequence() {
            // Flash effect
            elements.flashOverlay.classList.add('flash');
            setTimeout(() => {
                elements.flashOverlay.classList.remove('flash');
            }, 150);

            // Hide scanner
            elements.scannerSection.style.transition = 'opacity 0.5s ease';
            elements.scannerSection.style.opacity = '0';

            setTimeout(() => {
                elements.scannerSection.style.display = 'none';
                elements.decryptionSection.style.display = 'block';

                // Initialize hex matrix
                initHexMatrix();
                // Start decryption animation
                startDecryptionAnimation();
            }, 500);
        }

        function initHexMatrix() {
            hexMatrixWidth = elements.hexMatrix.width = window.innerWidth;
            hexMatrixHeight = elements.hexMatrix.height = window.innerHeight;
            hexMatrixCtx = elements.hexMatrix.getContext('2d');

            // Initialize columns
            const columnWidth = 20;
            hexColumns = [];
            for (let i = 0; i < Math.floor(hexMatrixWidth / columnWidth); i++) {
                hexColumns.push({
                    x: i * columnWidth,
                    y: Math.random() * -hexMatrixHeight,
                    speed: 1 + Math.random() * 2,
                    length: 10 + Math.floor(Math.random() * 20)
                });
            }

            // Start animation
            animateHexMatrix();
        }

        function animateHexMatrix() {
            hexMatrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            hexMatrixCtx.fillRect(0, 0, hexMatrixWidth, hexMatrixHeight);

            hexMatrixCtx.fillStyle = '#3fefef';
            hexMatrixCtx.font = '16px Consolas, monospace';

            hexColumns.forEach(column => {
                // Draw column characters
                for (let i = 0; i < column.length; i++) {
                    const char = hexChars[Math.floor(Math.random() * hexChars.length)];
                    const y = column.y + (i * 20);

                    // Gradient opacity
                    const opacity = i === 0 ? 1 : (1 - (i / column.length));
                    hexMatrixCtx.fillStyle = `rgba(63, 239, 239, ${opacity})`;

                    hexMatrixCtx.fillText(char, column.x, y);
                }

                // Move column down
                column.y += column.speed;

                // Reset column if it goes off screen
                if (column.y > hexMatrixHeight) {
                    column.y = -column.length * 20;
                }
            });

            // Continue animation if decryption section is visible
            if (elements.decryptionSection.style.display === 'block') {
                requestAnimationFrame(animateHexMatrix);
            }
        }

        function startDecryptionAnimation() {
            let progress = 0;
            const messages = [
                "Initializing decryption protocol...",
                "Accessing encrypted data streams...",
                "Breaking primary encryption layer...",
                "Bypassing firewall F1...",
                "Bypassing firewall F2...",
                "Bypassing firewall F3...",
                "Bypassing firewall F4...",
                "Bypassing firewall F5...",
                "Finalizing decryption...",
                "CORE SYSTEMS UNLOCKED"
            ];
            let messageIndex = 0;

            const interval = setInterval(() => {
                progress += 1;
                if (progress > 100) progress = 100;

                // Update progress bar
                elements.progressBar.style.width = `${progress}%`;
                elements.progressText.textContent = `${progress}%`;

                // Update status message at intervals
                if (progress % 10 === 0 && messageIndex < messages.length) {
                    elements.statusMessage.textContent = messages[messageIndex];
                    messageIndex++;
                }

                // Activate firewall nodes
                if (progress >= 30 && !elements.firewallNodes[0].classList.contains('active')) {
                    elements.firewallNodes[0].classList.add('active');
                }
                if (progress >= 40 && !elements.firewallNodes[1].classList.contains('active')) {
                    elements.firewallNodes[1].classList.add('active');
                }
                if (progress >= 50 && !elements.firewallNodes[2].classList.contains('active')) {
                    elements.firewallNodes[2].classList.add('active');
                }
                if (progress >= 60 && !elements.firewallNodes[3].classList.contains('active')) {
                    elements.firewallNodes[3].classList.add('active');
                }
                if (progress >= 70 && !elements.firewallNodes[4].classList.contains('active')) {
                    elements.firewallNodes[4].classList.add('active');
                }

                // Complete decryption
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        startNeuralVerification();
                    }, 1000);
                }
            }, CONFIG.DECRYPTION_DURATION / 100);
        }

        function startNeuralVerification() {
            // Flash effect
            elements.flashOverlay.classList.add('flash');
            setTimeout(() => {
                elements.flashOverlay.classList.remove('flash');
            }, 150);

            // Hide decryption
            elements.decryptionSection.style.transition = 'opacity 0.5s ease';
            elements.decryptionSection.style.opacity = '0';

            setTimeout(() => {
                elements.decryptionSection.style.display = 'none';
                elements.neuralSection.style.display = 'block';

                // Initialize neural visualization
                initNeuralVisualization();

                // Show overlay text
                setTimeout(() => {
                    elements.neuralTitle.classList.add('visible');
                    setTimeout(() => {
                        elements.identityConfirmed.classList.add('visible');
                        setTimeout(() => {
                            elements.nameDisplay.classList.add('visible');
                        }, 1000);
                    }, 2000);
                }, 500);

                // Auto-advance after duration
                setTimeout(() => {
                    completeExperience();
                }, CONFIG.NEURAL_DURATION);
            }, 500);
        }

        // Neural Network Visualization (Replace the current initNeuralVisualization and animateNeural functions)

        // ========== NEURAL NETWORK VISUALIZATION (CodePen: https://codepen.io/towc/pen/wGjXGY) ==========

        function initNeuralVisualization() {
            const c = document.getElementById('neuralCanvas');
            const ctx = c.getContext('2d');

            // Initialize variables as per the original CodePen
            var w = c.width = window.innerWidth,
                h = c.height = window.innerHeight,

                opts = {
                    range: 180,
                    baseConnections: 3,
                    addedConnections: 5,
                    baseSize: 5,
                    minSize: 1,
                    dataToConnectionSize: .4,
                    sizeMultiplier: .7,
                    allowedDist: 40,
                    baseDist: 40,
                    addedDist: 30,
                    connectionAttempts: 100,

                    dataToConnections: 1,
                    baseSpeed: .04,
                    addedSpeed: .05,
                    baseGlowSpeed: .4,
                    addedGlowSpeed: .4,

                    rotVelX: .003,
                    rotVelY: .002,

                    // KEEP ORIGINAL CODE PEN COLORS - DO NOT CHANGE
                    repaintColor: '#111',  // Original dark background
                    connectionColor: 'hsla(200,60%,light%,alp)',  // Original blue
                    rootColor: 'hsla(0,60%,light%,alp)',          // Original red
                    endColor: 'hsla(160,20%,light%,alp)',         // Original green
                    dataColor: 'hsla(40,80%,light%,alp)',         // Original yellow

                    wireframeWidth: .1,
                    wireframeColor: '#88f',  // Original blue wireframe

                    depth: 250,
                    focalLength: 250,
                    vanishPoint: {
                        x: w / 2,
                        y: h / 2
                    }
                },

                squareRange = opts.range * opts.range,
                squareAllowed = opts.allowedDist * opts.allowedDist,
                mostDistant = opts.depth + opts.range,
                sinX = sinY = 0,
                cosX = cosY = 0,

                connections = [],
                toDevelop = [],
                data = [],
                all = [],
                tick = 0,
                totalProb = 0,

                animating = false,

                Tau = Math.PI * 2;

            // Remove the loading text from original code (not needed in your flow)
            // Original had: ctx.fillStyle = '#222'; ctx.fillRect(0,0,w,h); ...
            // We start with a clear canvas matching your theme
            ctx.fillStyle = opts.repaintColor;
            ctx.fillRect(0, 0, w, h);

            // === ORIGINAL CODE STRUCTURE STARTS (slightly modified for integration) ===
            window.setTimeout(init, 4); // to render the loading screen

            function init() {
                connections.length = 0;
                data.length = 0;
                all.length = 0;
                toDevelop.length = 0;

                var connection = new Connection(0, 0, 0, opts.baseSize);
                connection.step = Connection.rootStep;
                connections.push(connection);
                all.push(connection);
                connection.link();

                while (toDevelop.length > 0) {
                    toDevelop[0].link();
                    toDevelop.shift();
                }

                if (!animating) {
                    animating = true;
                    anim();
                }
            }

            function Connection(x, y, z, size) {
                this.x = x;
                this.y = y;
                this.z = z;
                this.size = size;

                this.screen = {};

                this.links = [];
                this.probabilities = [];
                this.isEnd = false;

                this.glowSpeed = opts.baseGlowSpeed + opts.addedGlowSpeed * Math.random();
            }

            Connection.prototype.link = function () {
                if (this.size < opts.minSize)
                    return this.isEnd = true;

                var links = [],
                    connectionsNum = opts.baseConnections + Math.random() * opts.addedConnections | 0,
                    attempt = opts.connectionAttempts,

                    alpha, beta, len,
                    cosA, sinA, cosB, sinB,
                    pos = {},
                    passedExisting, passedBuffered;

                while (links.length < connectionsNum && --attempt > 0) {
                    alpha = Math.random() * Math.PI;
                    beta = Math.random() * Tau;
                    len = opts.baseDist + opts.addedDist * Math.random();

                    cosA = Math.cos(alpha);
                    sinA = Math.sin(alpha);
                    cosB = Math.cos(beta);
                    sinB = Math.sin(beta);

                    pos.x = this.x + len * cosA * sinB;
                    pos.y = this.y + len * sinA * sinB;
                    pos.z = this.z + len * cosB;

                    if (pos.x * pos.x + pos.y * pos.y + pos.z * pos.z < squareRange) {
                        passedExisting = true;
                        passedBuffered = true;
                        for (var i = 0; i < connections.length; ++i)
                            if (squareDist(pos, connections[i]) < squareAllowed)
                                passedExisting = false;

                        if (passedExisting)
                            for (var i = 0; i < links.length; ++i)
                                if (squareDist(pos, links[i]) < squareAllowed)
                                    passedBuffered = false;

                        if (passedExisting && passedBuffered)
                            links.push({ x: pos.x, y: pos.y, z: pos.z });
                    }
                }

                if (links.length === 0)
                    this.isEnd = true;
                else {
                    for (var i = 0; i < links.length; ++i) {
                        var pos = links[i],
                            connection = new Connection(pos.x, pos.y, pos.z, this.size * opts.sizeMultiplier);

                        this.links[i] = connection;
                        all.push(connection);
                        connections.push(connection);
                    }
                    for (var i = 0; i < this.links.length; ++i)
                        toDevelop.push(this.links[i]);
                }
            };

            Connection.prototype.step = function () {
                this.setScreen();
                this.screen.color = (this.isEnd ? opts.endColor : opts.connectionColor).replace('light', 30 + ((tick * this.glowSpeed) % 30)).replace('alp', .2 + (1 - this.screen.z / mostDistant) * .8);

                for (var i = 0; i < this.links.length; ++i) {
                    ctx.moveTo(this.screen.x, this.screen.y);
                    ctx.lineTo(this.links[i].screen.x, this.links[i].screen.y);
                }
            };

            Connection.rootStep = function () {
                this.setScreen();
                this.screen.color = opts.rootColor.replace('light', 30 + ((tick * this.glowSpeed) % 30)).replace('alp', (1 - this.screen.z / mostDistant) * .8);

                for (var i = 0; i < this.links.length; ++i) {
                    ctx.moveTo(this.screen.x, this.screen.y);
                    ctx.lineTo(this.links[i].screen.x, this.links[i].screen.y);
                }
            };

            Connection.prototype.draw = function () {
                ctx.fillStyle = this.screen.color;
                ctx.beginPath();
                ctx.arc(this.screen.x, this.screen.y, this.screen.scale * this.size, 0, Tau);
                ctx.fill();
            };

            function Data(connection) {
                this.glowSpeed = opts.baseGlowSpeed + opts.addedGlowSpeed * Math.random();
                this.speed = opts.baseSpeed + opts.addedSpeed * Math.random();

                this.screen = {};

                this.setConnection(connection);
            }

            Data.prototype.reset = function () {
                this.setConnection(connections[0]);
                this.ended = 2;
            };

            Data.prototype.step = function () {
                this.proportion += this.speed;

                if (this.proportion < 1) {
                    this.x = this.ox + this.dx * this.proportion;
                    this.y = this.oy + this.dy * this.proportion;
                    this.z = this.oz + this.dz * this.proportion;
                    this.size = (this.os + this.ds * this.proportion) * opts.dataToConnectionSize;
                } else
                    this.setConnection(this.nextConnection);

                this.screen.lastX = this.screen.x;
                this.screen.lastY = this.screen.y;
                this.setScreen();
                this.screen.color = opts.dataColor.replace('light', 40 + ((tick * this.glowSpeed) % 50)).replace('alp', .2 + (1 - this.screen.z / mostDistant) * .6);
            };

            Data.prototype.draw = function () {
                if (this.ended)
                    return --this.ended; // not sure why the thing lasts 2 frames, but it does

                ctx.beginPath();
                ctx.strokeStyle = this.screen.color;
                ctx.lineWidth = this.size * this.screen.scale;
                ctx.moveTo(this.screen.lastX, this.screen.lastY);
                ctx.lineTo(this.screen.x, this.screen.y);
                ctx.stroke();
            };

            Data.prototype.setConnection = function (connection) {
                if (connection.isEnd)
                    this.reset();
                else {
                    this.connection = connection;
                    this.nextConnection = connection.links[connection.links.length * Math.random() | 0];

                    this.ox = connection.x; // original coordinates
                    this.oy = connection.y;
                    this.oz = connection.z;
                    this.os = connection.size; // base size

                    this.nx = this.nextConnection.x; // new
                    this.ny = this.nextConnection.y;
                    this.nz = this.nextConnection.z;
                    this.ns = this.nextConnection.size;

                    this.dx = this.nx - this.ox; // delta
                    this.dy = this.ny - this.oy;
                    this.dz = this.nz - this.oz;
                    this.ds = this.ns - this.os;

                    this.proportion = 0;
                }
            };

            Connection.prototype.setScreen = Data.prototype.setScreen = function () {
                var x = this.x,
                    y = this.y,
                    z = this.z;

                // apply rotation on X axis
                var Y = y;
                y = y * cosX - z * sinX;
                z = z * cosX + Y * sinX;

                // rot on Y
                var Z = z;
                z = z * cosY - x * sinY;
                x = x * cosY + Z * sinY;

                this.screen.z = z;

                // translate on Z
                z += opts.depth;

                this.screen.scale = opts.focalLength / z;
                this.screen.x = opts.vanishPoint.x + x * this.screen.scale;
                this.screen.y = opts.vanishPoint.y + y * this.screen.scale;
            };

            function squareDist(a, b) {
                var x = b.x - a.x,
                    y = b.y - a.y,
                    z = b.z - a.z;

                return x * x + y * y + z * z;
            }

            function anim() {
                // Only animate if the neural section is visible
                if (!animating || elements.neuralSection.style.display !== 'block') {
                    return;
                }

                window.requestAnimationFrame(anim);

                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = opts.repaintColor;
                ctx.fillRect(0, 0, w, h);

                ++tick;

                var rotX = tick * opts.rotVelX,
                    rotY = tick * opts.rotVelY;

                cosX = Math.cos(rotX);
                sinX = Math.sin(rotX);
                cosY = Math.cos(rotY);
                sinY = Math.sin(rotY);

                if (data.length < connections.length * opts.dataToConnections) {
                    var datum = new Data(connections[0]);
                    data.push(datum);
                    all.push(datum);
                }

                ctx.globalCompositeOperation = 'lighter';
                ctx.beginPath();
                ctx.lineWidth = opts.wireframeWidth;
                ctx.strokeStyle = opts.wireframeColor;
                all.map(function (item) { item.step(); });
                ctx.stroke();
                ctx.globalCompositeOperation = 'source-over';
                all.sort(function (a, b) { return b.screen.z - a.screen.z; });
                all.map(function (item) { item.draw(); });
            }

            // Modified resize handler for your page
            const neuralResizeHandler = function () {
                // Update canvas dimensions
                w = c.width = window.innerWidth;
                h = c.height = window.innerHeight;

                // Update vanish point
                opts.vanishPoint.x = w / 2;
                opts.vanishPoint.y = h / 2;

                // Redraw background
                ctx.fillStyle = opts.repaintColor;
                ctx.fillRect(0, 0, w, h);
            };

            // Add the neural network's resize handler to your existing window resize listener
            // You'll need to add this line to your existing window resize event handler:
            // neuralResizeHandler();

            // === ORIGINAL CODE STRUCTURE ENDS ===

            // Store the resize handler so it can be called from your main resize function
            window.neuralResizeHandler = neuralResizeHandler;

            // Start the animation immediately (modified from original which waited for click)
            init();
        }

        // This function is no longer needed as animation is handled within initNeuralVisualization
        function animateNeural() {
            // Empty function - animation is handled by the neural network's own anim() function
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            // Resize hex matrix
            if (hexMatrixCtx) {
                hexMatrixWidth = elements.hexMatrix.width = window.innerWidth;
                hexMatrixHeight = elements.hexMatrix.height = window.innerHeight;
            }

            // Resize neural visualization (calls the neural network's exact resize handler)
            if (window.neuralResizeHandler) {
                window.neuralResizeHandler();
            }
        });

        window.onload = displayTerminalSequence;

        // Add to your elements object
        elements.personnelSection = document.getElementById('personnel-section');

        // Initialize personnel data
        function initializePersonnelData() {
            // Personal data (customize these!)
            const personData = {
                name: "ZAARGULL",
                dob: "2003-02-10", // Change to actual birthday
                clearance: "OMEGA-9",
                traits: {
                    intelligence: 94,
                    loyalty: 98,
                    humor: 88,
                    creativity: 92
                }
            };

            // Calculate age
            const dob = new Date(personData.dob);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            // Check if today is birthday
            const isBirthday = today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate();

            // Update DOM elements
            document.getElementById('data-name').textContent = personData.name;
            document.getElementById('data-age').textContent = `${age} YEARS`;
            document.getElementById('data-dob').textContent = personData.dob;
            document.getElementById('data-clearance').textContent = personData.clearance;

            // Birthday status
            const birthdayElement = document.getElementById('data-birthday');
            const birthdayIcon = document.querySelector('.birthday-indicator');

            if (isBirthday) {
                birthdayElement.textContent = "BIRTHDAY ACTIVE 🎉";
                birthdayElement.style.color = "#3eff3e";
                birthdayElement.style.textShadow = "0 0 10px #3eff3e";
                birthdayIcon.style.display = 'block';

                // Add celebration effect
                document.querySelector('.birthday-icon').style.animation = 'float 1.5s infinite ease-in-out';
                document.querySelector('.pulse-ring').style.animation = 'pulse-ring 1s infinite';
            } else {
                birthdayElement.textContent = "BIRTHDAY INACTIVE";
                birthdayElement.style.color = "#8f9f8f";
                birthdayIcon.style.display = 'none';
            }

            // Update timestamp
            function updateTimestamp() {
                const now = new Date();
                const timeString = now.toISOString().replace('T', ' ').substring(0, 19);
                document.getElementById('current-time').textContent = timeString + ' UTC';
            }

            updateTimestamp();
            setInterval(updateTimestamp, 1000);

            // Button event listeners - IMPORTANT: UPDATED CELEBRATE BUTTON
            document.getElementById('restart-btn').addEventListener('click', () => {
                location.reload();
            });

            document.getElementById('celebrate-btn').addEventListener('click', () => {
                // Change button text to show it's working
                const celebrateBtn = document.getElementById('celebrate-btn');
                celebrateBtn.textContent = "ACTIVATING...";
                celebrateBtn.disabled = true;

                // Celebration animation
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.top = '0';
                confetti.style.left = '0';
                confetti.style.width = '100%';
                confetti.style.height = '100%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                document.body.appendChild(confetti);

                // Create falling particles
                for (let i = 0; i < 100; i++) {
                    const particle = document.createElement('div');
                    particle.style.position = 'absolute';
                    particle.style.width = '10px';
                    particle.style.height = '10px';
                    particle.style.background = ['#3fefef', '#3eff3e', '#00ffaa'][Math.floor(Math.random() * 3)];
                    particle.style.borderRadius = '50%';
                    particle.style.left = Math.random() * 100 + 'vw';
                    particle.style.top = '-10px';
                    particle.style.boxShadow = '0 0 10px currentColor';
                    confetti.appendChild(particle);

                    // Animation
                    particle.animate([
                        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                        { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
                    ], {
                        duration: 2000 + Math.random() * 2000,
                        easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
                    });
                }

                // After celebration, transition to mission briefing
                setTimeout(() => {
                    confetti.remove();
                    celebrateBtn.textContent = "PROCEEDING...";

                    // Transition to mission briefing
                    transitionToMissionBriefing();
                }, 3500);
            });
        }

        // ========== MISSION BRIEFING FUNCTIONS ==========

        // Add to your elements object
        elements.missionSection = document.getElementById('mission-section');

        // Set the target birthday date (UPDATE THIS WITH ACTUAL BIRTHDAY)
        const BIRTHDAY_DATE = new Date('2003-02-10'); // Change to actual birthday

        // Update the completeExperience function to show mission briefing
        function completeExperience() {
            // Flash effect
            elements.flashOverlay.classList.add('flash');
            setTimeout(() => {
                elements.flashOverlay.classList.remove('flash');

                // Hide neural section
                elements.neuralSection.style.opacity = '0';
                setTimeout(() => {
                    elements.neuralSection.style.display = 'none';

                    // Show PERSONNEL FILE first
                    elements.personnelSection.style.display = 'block';
                    elements.personnelSection.style.overflowY = 'auto';
                    elements.personnelSection.scrollTop = 0;
                    setTimeout(() => {
                        elements.personnelSection.style.opacity = '1';

                        // Initialize personnel data
                        initializePersonnelData();

                        // REMOVED: setupMissionTransition();
                        // We'll use the celebration button instead
                    }, 100);
                }, 500);
            }, 150);
        }

        // New function to handle transition to mission briefing
        function setupMissionTransition() {
            // Option 1: Automatic transition after delay (10 seconds)
            setTimeout(() => {
                transitionToMissionBriefing();
            }, 10000); // 10 seconds

            // Option 2: Add a "Next" button to personnel file
            const nextButton = document.createElement('button');
            nextButton.textContent = 'PROCEED TO MISSION BRIEFING';
            nextButton.className = 'cyber-btn primary';
            nextButton.style.marginTop = '20px';
            nextButton.style.display = 'block';
            nextButton.style.marginLeft = 'auto';
            nextButton.style.marginRight = 'auto';

            // Add button to personnel file footer
            const footer = document.querySelector('.file-footer');
            if (footer) {
                footer.appendChild(nextButton);
                nextButton.addEventListener('click', transitionToMissionBriefing);
            }
        }

        // Function to transition from personnel to mission briefing
        function transitionToMissionBriefing() {
            // Hide personnel section
            elements.personnelSection.style.opacity = '0';
            setTimeout(() => {
                elements.personnelSection.style.display = 'none';

                // Show mission briefing
                elements.missionSection.style.display = 'block';
                setTimeout(() => {
                    elements.missionSection.style.opacity = '1';

                    // Start mission countdown timer
                    startCountdown();

                    // Initialize mission objectives lock system
                    initializeMissionObjectives();
                }, 100);
            }, 500);
        }

        // Countdown Timer Function
        function startCountdown() {
            const daysElement = document.getElementById('days');
            const hoursElement = document.getElementById('hours');
            const minutesElement = document.getElementById('minutes');
            const secondsElement = document.getElementById('seconds');

            function updateCountdown() {
                const now = new Date();

                // Set next birthday
                const currentYear = now.getFullYear();
                let nextBirthday = new Date(
                    currentYear,
                    BIRTHDAY_DATE.getMonth(),
                    BIRTHDAY_DATE.getDate()
                );

                // If birthday already passed this year, set to next year
                if (now > nextBirthday) {
                    nextBirthday.setFullYear(currentYear + 1);
                }

                // Calculate time difference
                const diff = nextBirthday - now;

                // Calculate days, hours, minutes, seconds
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                // Update display
                daysElement.textContent = String(days).padStart(2, '0');
                hoursElement.textContent = String(hours).padStart(2, '0');
                minutesElement.textContent = String(minutes).padStart(2, '0');
                secondsElement.textContent = String(seconds).padStart(2, '0');

                // Add animation when numbers change
                [daysElement, hoursElement, minutesElement, secondsElement].forEach(el => {
                    el.classList.add('changing');
                    setTimeout(() => el.classList.remove('changing'), 300);
                });

                // Check if it's birthday today
                if (days === 0 && hours === 0 && minutes === 0 && seconds < 10) {
                    // Birthday countdown celebration
                    celebrateBirthdayCountdown(seconds);
                }
            }

            // Update immediately and every second
            updateCountdown();
            const countdownInterval = setInterval(updateCountdown, 1000);

            // Store interval for cleanup
            window.countdownInterval = countdownInterval;
        }

        // Mission Acceptance Function
        function startMission() {
            // Show confirmation
            const confirmation = document.createElement('div');
            confirmation.className = 'confirmation-box';
            confirmation.innerHTML = `
        <h2>🎉 MISSION ACCEPTED!</h2>
        <p>Birthday protocols activated. Celebrations have been initiated across all systems.</p>
        <div class="mission-progress">
            <div class="progress-text">INITIALIZING CELEBRATION...</div>
            <div class="progress-bar">
                <div class="progress-fill" id="mission-progress"></div>
            </div>
        </div>
    `;
            document.body.appendChild(confirmation);

            // Show box
            setTimeout(() => {
                confirmation.style.display = 'block';

                // Animate progress bar
                setTimeout(() => {
                    const progressFill = document.getElementById('mission-progress');
                    progressFill.style.width = '100%';

                    // After completion
                    setTimeout(() => {
                        confirmation.innerHTML = `
                    <h2>✅ MISSION COMPLETE!</h2>
                    <p>All birthday objectives have been successfully accomplished.</p>
                    <p style="color: #00ffaa; margin-top: 20px;">Enjoy your special day!</p>
                    <button class="mission-btn" onclick="closeConfirmation()">CONTINUE</button>
                `;
                    }, 2000);
                }, 500);
            }, 100);
        }

        // Share Achievement Function
        function shareAchievement() {
            // Create share modal
            const shareModal = document.createElement('div');
            shareModal.className = 'confirmation-box';
            shareModal.innerHTML = `
        <h2>📡 BROADCAST ACHIEVEMENT</h2>
        <p>Share your birthday mission completion:</p>
        <div style="margin: 30px 0;">
            <div style="background: rgba(20,30,20,0.8); padding: 20px; border-radius: 5px; border: 1px solid #3fefef;">
                <p style="color: #cfcfcf; margin: 0;">🎂 I just completed the Birthday Mission Briefing!</p>
                <p style="color: #8f9f8f; margin: 10px 0 0 0; font-size: 0.9em;">#BirthdayOps #CyberCelebration</p>
            </div>
        </div>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button class="mission-btn" onclick="simulateShare('twitter')">TWITTER</button>
            <button class="mission-btn" onclick="simulateShare('whatsapp')">WHATSAPP</button>
            <button class="mission-btn" onclick="copyToClipboard()">COPY</button>
        </div>
        <button class="mission-btn" style="margin-top: 20px; background: transparent;" onclick="closeConfirmation()">CANCEL</button>
    `;
            document.body.appendChild(shareModal);

            setTimeout(() => {
                shareModal.style.display = 'block';
            }, 100);
        }

        // Simulate sharing
        function simulateShare(platform) {
            const message = "🎂 I just completed the Birthday Mission Briefing! #BirthdayOps #CyberCelebration";

            const platforms = {
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
                whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`
            };

            if (platforms[platform]) {
                // In real app, you would use window.open
                alert(`Sharing to ${platform.toUpperCase()}:\n\n${message}`);
            }

            // Close modal after "sharing"
            setTimeout(() => {
                const modals = document.querySelectorAll('.confirmation-box');
                modals.forEach(modal => modal.remove());
            }, 1500);
        }

        // Copy to clipboard
        function copyToClipboard() {
            const text = "🎂 I just completed the Birthday Mission Briefing! #BirthdayOps #CyberCelebration";

            navigator.clipboard.writeText(text).then(() => {
                alert("Text copied to clipboard!");

                // Close modal
                const modals = document.querySelectorAll('.confirmation-box');
                modals.forEach(modal => modal.remove());
            });
        }

        // Close confirmation
        function closeConfirmation() {
            const modals = document.querySelectorAll('.confirmation-box');
            modals.forEach(modal => modal.remove());
        }

        // Birthday celebration animation
        function celebrateBirthdayCountdown(secondsLeft) {
            if (secondsLeft === 9) { // Start at 10 seconds
                // Add celebration effects
                const missionTerminal = document.querySelector('.mission-terminal');

                // Add pulsing animation
                missionTerminal.style.animation = 'none';
                setTimeout(() => {
                    missionTerminal.style.animation = 'terminal-pulse 0.5s infinite alternate';
                }, 10);

                // Add particles
                for (let i = 0; i < 20; i++) {
                    createBirthdayParticle();
                }

                // Play sound if available
                playCountdownBeep();
            }
        }

        // Create birthday particle
        function createBirthdayParticle() {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '20px';
            particle.style.height = '20px';
            particle.innerHTML = ['🎂', '🎉', '🎁', '✨'][Math.floor(Math.random() * 4)];
            particle.style.fontSize = '20px';
            particle.style.zIndex = '9999';
            particle.style.pointerEvents = 'none';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = '100vh';
            document.body.appendChild(particle);

            // Animate
            particle.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(-${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 3000,
                easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
            });

            // Remove after animation
            setTimeout(() => particle.remove(), 5000);
        }

        // Add CSS for particle animation
        const style = document.createElement('style');
        style.textContent = `
    @keyframes terminal-pulse {
        from { box-shadow: 0 0 80px rgba(63, 239, 239, 0.4); }
        to { box-shadow: 0 0 120px rgba(63, 239, 239, 0.8), 0 0 200px rgba(0, 255, 170, 0.3); }
    }
    
    .changing {
        animation: number-change 0.3s ease-out;
    }
    
    @keyframes number-change {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); color: #00ffaa; }
        100% { transform: scale(1); }
    }
    
    @keyframes blink-cursor {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;
        document.head.appendChild(style);

        // Play countdown beep sound
        function playCountdownBeep() {
            // Create audio context for beep sound
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (e) {
                console.log("Audio not supported");
            }
        }

        // Cleanup function
        function cleanupMission() {
            if (window.countdownInterval) {
                clearInterval(window.countdownInterval);
            }
        }

        // ========== MISSION OBJECTIVES LOCK SYSTEM ==========

        const missionState = {
            objective1: { unlocked: false, completed: false, world: "cake_world" },
            objective2: { unlocked: false, completed: false, world: "message_world" },
            objective3: { unlocked: false, completed: false, world: "gift_world" },
            objective4: { unlocked: true, completed: false, world: "celebration_world" } // Start unlocked
        };

        // Initialize mission objectives
        function initializeMissionObjectives() {
            const objectives = document.querySelectorAll('.cyber-list li');

            objectives.forEach((obj, index) => {
                const objectiveNumber = index + 1;
                const state = missionState[`objective${objectiveNumber}`];

                // Add click handler
                obj.addEventListener('click', () => {
                    if (state.unlocked && !state.completed) {
                        enterWorld(state.world);
                    } else if (!state.unlocked) {
                        showLockedMessage(objectiveNumber);
                    }
                });

                // Update visual state
                updateObjectiveVisual(obj, state, objectiveNumber);
            });
        }

        // Update the function to prevent duplicate icons
        function updateObjectiveVisual(element, state, number) {
            // Remove any existing icons first
            const text = element.textContent.replace(/[🔓🔒✅]/g, '').trim();
            element.textContent = text;

            if (state.completed) {
                element.innerHTML += ' ✅';
                element.style.opacity = '0.7';
                element.style.cursor = 'default';
                element.classList.remove('pulse-unlocked');
            } else if (state.unlocked) {
                element.innerHTML += ' 🔓';
                element.style.cursor = 'pointer';
                element.classList.add('pulse-unlocked');
            } else {
                element.innerHTML += ' 🔒';
                element.style.opacity = '0.5';
                element.style.cursor = 'not-allowed';
                element.classList.add('objective-locked');
            }
        }
        // Enter world function
        function enterWorld(world) {
            const message = document.createElement('div');
            message.className = 'confirmation-box';
            message.style.background = 'rgba(0, 20, 40, 0.95)';
            message.style.border = '2px solid #3fefef';
            message.innerHTML = `
                <h2>⚡ ENTERING WORLD ⚡</h2>
                <p style="font-size: 1.3em; color: #00ffaa; margin: 20px 0; letter-spacing: 2px;">${world.replace(/_/g, ' ').toUpperCase()}</p>
                <div class="mission-progress">
                    <div class="progress-text">INITIALIZING...</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="world-progress"></div>
                    </div>
                </div>
                <p style="font-size: 0.8em; color: #8f9f8f; margin-top: 20px;">Loading immersive experience...</p>
            `;
            document.body.appendChild(message);

            setTimeout(() => {
                const progressFill = document.getElementById('world-progress');
                if (progressFill) {
                    progressFill.style.width = '100%';

                    // Complete world entry
                    setTimeout(() => {
                        message.innerHTML = `
                            <h2>✅ WORLD LOADED</h2>
                            <p>Exploring: <span style="color: #00ffaa;">${world.replace(/_/g, ' ').toUpperCase()}</span></p>
                            <p style="margin-top: 20px; color: #8f9f8f; font-size: 0.9em;">This is where the interactive world content will appear!</p>
                            <button class="mission-btn" onclick="completeObjective('${world}')">COMPLETE OBJECTIVE</button>
                            <button class="mission-btn" style="background: transparent; margin-top: 10px;" onclick="closeConfirmation()">RETURN</button>
                        `;
                    }, 2000);
                }
            }, 100);
        }

        // Show locked message
        function showLockedMessage(objectiveNumber) {
            const message = document.createElement('div');
            message.className = 'confirmation-box';
            message.style.background = 'rgba(40, 20, 0, 0.95)';
            message.style.border = '2px solid #ff6b6b';
            message.innerHTML = `
                <h2>🔒 OBJECTIVE LOCKED</h2>
                <p>Objective ${objectiveNumber} is currently locked.</p>
                <p style="color: #ffaa00; margin-top: 20px;">Complete the previous objectives to unlock this world.</p>
                <button class="mission-btn" onclick="closeConfirmation()" style="margin-top: 20px;">UNDERSTOOD</button>
            `;
            document.body.appendChild(message);

            setTimeout(() => {
                message.style.display = 'block';
            }, 100);
        }

        // Complete objective function
        function completeObjective(world) {
            // Find which objective this is
            for (const [key, state] of Object.entries(missionState)) {
                if (state.world === world) {
                    state.completed = true;

                    // Unlock next objective
                    const nextKey = `objective${parseInt(key.replace('objective', '')) + 1}`;
                    if (missionState[nextKey]) {
                        missionState[nextKey].unlocked = true;
                    }

                    break;
                }
            }

            // Show completion message
            const message = document.createElement('div');
            message.className = 'confirmation-box';
            message.innerHTML = `
                <h2>🎉 OBJECTIVE COMPLETE!</h2>
                <p>World exploration successful!</p>
                <p style="color: #00ffaa; margin-top: 20px; font-size: 1.1em;">Unlocking next world...</p>
            `;
            document.body.appendChild(message);

            setTimeout(() => {
                message.remove();
                closeConfirmation();

                // Refresh objectives display
                initializeMissionObjectives();
            }, 2000);
        }
    
