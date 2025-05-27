class SnakeGame {

    constructor(canvasId, scoreId) {

        // pause machen
        this.isPaused = false;

        // Canvas- und Score-Elemente abrufen
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
        this.scoreElement = document.getElementById(scoreId);

        // Spielfeldgrösse: 20x20 Felder
        this.tileCount = 20;
        this.tileSize = this.canvas.width / this.tileCount;

        // Schlange beginnt in der Mitte des Feldes
        this.snake = [{ x: 10, y: 10 }];
        this.velocity = { x: 0, y: 0 }; // Startbewegung: nach rechts

        this.food = this.randomPosition(); // Zufällige Startposition für Futter
        this.score = 0;
        this.gameOver = false;

        // Tastatur- und Resize-Ereignisse registrieren
        this.bindEvents();

        // Speicher des Namens beim klicken auf den Button
        document.getElementById("saveScoreButton").addEventListener("click", () => {
            const name = document.getElementById("playerNameInput");
            const obj = {
                name: name.value || "Anonym",
                score: this.score,
                date: new Date().toISOString()
            };

            const scores = JSON.parse(localStorage.getItem("scores")) || [];
            scores.push(obj);
            localStorage.setItem("scores", JSON.stringify(scores));

            this.renderHighscores(); // Liste aktualisieren
        });

        // Steuerungsbuttons
        document.getElementById("upBtn")?.addEventListener("click", () => {
            if (this.velocity.y === 0) this.velocity = { x: 0, y: -1 };
        });
        document.getElementById("downBtn")?.addEventListener("click", () => {
            if (this.velocity.y === 0) this.velocity = { x: 0, y: 1 };
        });
        document.getElementById("leftBtn")?.addEventListener("click", () => {
            if (this.velocity.x === 0) this.velocity = { x: -1, y: 0 };
        });
        document.getElementById("rightBtn")?.addEventListener("click", () => {
            if (this.velocity.x === 0) this.velocity = { x: 1, y: 0 };
        });

        // Spielfeld an Bildschirmgrösse anpassen
        this.resizeCanvas();

        // Spielzyklus alle 100ms
        this.loop = setInterval(this.update.bind(this), 100);

        // Bestenliste anzeigen
        this.renderHighscores();

        // NEU: Futter-Wert und Countdown
        this.foodValue = 1; // Anfangswert: 1 Punkt
        this.nextFoodValue = 1;  // Nächster Futterwert (wird bei Futterverzehr aktualisiert)
        this.foodCountdown = 0; // Sekunden-Countdown für Spezialfutter
        this.specialPhase = false; // Ist Spezialphase gerade aktiv?
        this.specialColor = "#ff0"; // Gelb als Farbe für Spezial-Schlange
        this.foodTimer = null; // Damit wir den Timer stoppen können
        this.growAmount = 0; // Wie viel die Schlange noch wachsen soll
        this.prepareNextFood = false;
        // / Markiert, ob im nächsten Update neues Futter gesetzt werden soll

        // Spezialfutter gleich zu Beginn vorbereiten und setzen
        this.prepareSpecialFood();
        this.placeNewFood();
    }

    // Passt die Grösse des Spielfelds an die Fenstergrösse an (max. 600px)
    resizeCanvas() {
        const size = Math.min(window.innerWidth, 600);
        this.canvas.width = size;
        this.canvas.height = size;
        this.tileSize = this.canvas.width / this.tileCount;
        this.draw();
    }

    // Tasteneingaben und Fenstergrössenänderungen behandeln
    bindEvents() {
        window.addEventListener("keydown", this.handleKey.bind(this));
        window.addEventListener("resize", this.resizeCanvas.bind(this));
    }

    // Pfeiltasten zur Steuerung der Schlange
    handleKey(e) {
        const { x, y } = this.velocity;
        if (e.key === " ") {
            this.isPaused = !this.isPaused;
            return;
        }
        switch (e.key) {
            case "ArrowUp": if (y === 0) this.velocity = { x: 0, y: -1 }; break;
            case "ArrowDown": if (y === 0) this.velocity = { x: 0, y: 1 }; break;
            case "ArrowLeft": if (x === 0) this.velocity = { x: -1, y: 0 }; break;
            case "ArrowRight": if (x === 0) this.velocity = { x: 1, y: 0 }; break;
        }
    }

    // Spielzyklus: Bewegungslogik, Kollisionen, Zeichnen
    update() {
        if (this.gameOver || this.isPaused) return;

        const nextHead = { ...this.snake[0] };
        nextHead.x += this.velocity.x;
        nextHead.y += this.velocity.y;

        if (this.isCollision(nextHead)) {
            this.gameOver = true;
            clearInterval(this.loop);
            document.getElementById("finalScore").textContent = this.score;
            document.getElementById("gameOverMessage").style.display = "flex";
            return;
        }

        // Wenn kein Wachstum vorgesehen ist, entferne das letzte Segment
        if (this.growAmount === 0) {
            this.snake.pop();
        }

        // Kopf an den Anfang setzen
        this.snake.unshift(nextHead);

        if (nextHead.x === this.food.x && nextHead.y === this.food.y) {
            const punkte = this.foodValue;
            this.score += punkte;
            this.growAmount += punkte;

            if (this.foodTimer) clearInterval(this.foodTimer);

            this.prepareNextFood = true;
        } else if (this.growAmount > 0) {
            this.growAmount--;
        }

        this.draw();

        if (this.prepareNextFood) {
            this.prepareSpecialFood();
            this.placeNewFood();
            this.prepareNextFood = false;
        }
    }


    // Prüft, ob Schlange aus dem Feld läuft oder sich selbst trifft
    isCollision(pos) {
        return (
            pos.x < 0 || pos.x >= this.tileCount ||
            pos.y < 0 || pos.y >= this.tileCount ||
            this.snake.slice(1).some(segment => segment.x === pos.x && segment.y === pos.y)
        );
    }

    // Generiert zufällige Position für das Futter (nicht auf Schlange)
    randomPosition() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === position.x && segment.y === position.y));
        return position;
    }

    // Zeichnet Spielfeld, Schlange, Futter und Punktestand
    draw() {
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = this.specialPhase ? this.specialColor : "#0f0";
        this.snake.forEach(segment => {
            this.context.fillRect(
                segment.x * this.tileSize,
                segment.y * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        });

        // Futterfarbe je nach Wert
        if (this.foodValue === 1) {
            this.context.fillStyle = "#f00"; // Rot für normales Futter
        } else if (this.foodValue === 5) {
            this.context.fillStyle = "#00f"; // Blau für Spezialfutter (5 Punkte)
        } else if (this.foodValue === 10) {
            this.context.fillStyle = "#800080"; // rot für Spezialfutter (10 Punkte)
        }

        this.context.fillRect(
            this.food.x * this.tileSize,
            this.food.y * this.tileSize,
            this.tileSize,
            this.tileSize
        );

        if (this.specialPhase) {
            this.context.fillStyle = this.specialColor;
            this.snake.forEach(segment => {
                this.context.fillRect(
                    segment.x * this.tileSize,
                    segment.y * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
            });

            this.context.fillStyle = "#fff";
            this.context.font = "16px Arial";
            this.context.fillText(
                `Bonus: ${this.foodValue} Punkte – ${this.foodCountdown}s`,
                10,
                20
            );
        }

        this.scoreElement.textContent = "Punkte: " + this.score;
    }

    // Bestenliste anzeigen
    renderHighscores() {
        const highscoreList = document.getElementById("highscoreList");
        highscoreList.innerHTML = "";

        const scores = JSON.parse(localStorage.getItem("scores")) || [];
        scores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(a.date) - new Date(b.date);
        });

        const maxEntries = 5;
        const topScores = scores.slice(0, maxEntries);

        topScores.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = `${entry.name}: ${entry.score} Punkte – ${new Date(entry.date).toLocaleString()}`;
            highscoreList.appendChild(li);
        });
    }

    // Spezialfutter vorbereiten
    prepareSpecialFood() {
        const rand = Math.random();
        if (rand < 0.7) {
            this.nextFoodValue = 1;
        } else if (rand < 0.9) {
            this.nextFoodValue = 5;
        } else {
            this.nextFoodValue = 10;
        }
    }

    // Neues Futter setzen und ggf. Spezialphase starten
    placeNewFood() {
        this.food = this.randomPosition();
        this.foodValue = this.nextFoodValue;

        if (this.foodValue > 1) {
            this.specialPhase = true;
            this.foodCountdown = this.foodValue === 5 ? 10 : 4;

            if (this.foodTimer) clearInterval(this.foodTimer);
            this.foodTimer = setInterval(() => {
                this.foodCountdown--;
                if (this.foodCountdown <= 0) {
                    this.foodValue = 1;
                    this.specialPhase = false;
                    clearInterval(this.foodTimer);
                    this.foodTimer = null;
                }
            }, 1000);
        } else {
            this.specialPhase = false;
        }
    }

}

// Startet das Spiel nach dem Laden der Seite
window.onload = () => {
    new SnakeGame("gameCanvas", "score");
};
