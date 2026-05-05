   import { getGameDetails, getGameScreenshots } from './index-CYDz2EnO';

        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('id');

        if (gameId) {

            getGameDetails(gameId).then(game => {
                if (game) {
                    getGameScreenshots(gameId).then(screenshots => {
                        renderGameDetails(game, screenshots);
                    });
                } else {
                    document.getElementById('game-details').innerHTML = '<p>Game details not found.</p>';
                }
            });
        } else {
            document.getElementById('game-details').innerHTML = '<p>No game ID provided in URL.</p>';
        }

        function renderGameDetails(game, screenshots) {
            const gameDetailsDiv = document.getElementById('game-details');
            document.title = game.name + " - Game Details";

            const heroSection = `
                <div class="hero-section">
                    <div class="hero-background">
                        <img src="${game.background_image}"alt="${game.name} Background" class="hero-image">
                        <div class="hero-overlay"></div>
                    </div>
                    <div class="hero-content container">
                        <div class="game-header">
                            <h1 class="game-title">${game.name}</h1>
                            <div class="game-meta">
                                <span class="release-date">${new Date(game.released).getFullYear()}</span>
                                <span class="genre-list">${game.genres.map(g => g.name).join(' • ')}</span>
                                ${game.esrb_rating ? `<span class="rating-badge">${game.esrb_rating.name}</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="hero-stats">
                            <div class="hero-stat">
                                <span class="stat-value">${game.metacritic || 'N/A'}</span>
                                <span class="stat-label">Metascore</span>
                            </div>
                            <div class="hero-stat">
                                <span class="stat-value">${game.rating}</span>
                                <span class="stat-label">Rating</span>
                            </div>
                            <div class="hero-stat">
                                <span class="stat-value">${game.playtime}h</span>
                                <span class="stat-label">Playtime</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Create content section
            const contentSection = `
                <div class="content-section container">
                    <div class="main-content">
                        <section class="description-section">
                            <p class="description">${game.description_raw || game.description}</p>
                        </section>

                        <section class="platforms-section">
                            <h3>Platforms</h3>
                            <div class="platforms-list">
                                ${game.platforms.map(p => `<span class="platform-chip">${p.platform.name}</span>`).join('')}
                            </div>
                        </section>

                        <section class="screenshots-section">
                            <h3>Screenshots</h3>
                            <div class="screenshots-grid">
                                ${screenshots.map(s => `<img src="${s.image}" alt="Screenshot" class="screenshot-item" loading="lazy">`).join('')}
                            </div>
                        </section>
                    </div>

                    <aside class="sidebar">
                        <div class="minimal-info">
                            <div class="info-group">
                                <h4>Developers</h4>
                                <p>${game.developers.map(dev => dev.name).join(', ')}</p>
                            </div>
                            <div class="info-group">
                                <h4>Publishers</h4>
                                <p>${game.publishers.map(pub => pub.name).join(', ')}</p>
                            </div>
                            <div class="info-group">
                                <h4>Available on</h4>
                                <div class="store-minimal">
                                    ${game.stores.map(store => `
                                        <a href="#" class="store-icon" title="${store.store.name}">${getStoreIcon(store.store.name)}</a>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            `;

            gameDetailsDiv.innerHTML = heroSection + contentSection;
        }

        function generateStars(rating) {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let stars = '';

            for (let i = 0; i < fullStars; i++) {
                stars += '<span class="star filled">★</span>';
            }

            if (hasHalfStar) {
                stars += '<span class="star half">★</span>';
            }

            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            for (let i = 0; i < emptyStars; i++) {
                stars += '<span class="star">★</span>';
            }

            return stars;
        }

        function getPlatformIcon(platformName) {
            const icons = {
                'PC': '<i class="bi bi-pc-display"></i>',
                'PlayStation 5': '<i class="bi bi-controller"></i>',
                'PlayStation 4': '<i class="bi bi-controller"></i>',
                'PlayStation 3': '<i class="bi bi-controller"></i>',
                'Xbox Series S/X': '<i class="bi bi-xbox"></i>',
                'Xbox One': '<i class="bi bi-xbox"></i>',
                'Xbox 360': '<i class="bi bi-xbox"></i>'
            };
            return icons[platformName] || '<i class="bi bi-controller"></i>';
        }


        function getStoreIcon(storeName) {
            const icons = {
                'Steam': '<i class="bi bi-steam"></i>',
                'Epic Games': '<i class="bi bi-controller"></i>',
                'PlayStation Store': '<i class="bi bi-playstation"></i>',
                'Xbox Store': '<i class="bi bi-xbox"></i>',
                'Microsoft Store': '<i class="bi bi-windows"></i>',
                'Apple App Store': '<i class="bi bi-apple"></i>',
                'GOG': '<i class="bi bi-capslock"></i>',  // No official icon, placeholder
                'Nintendo eShop': '<i class="bi bi-controller"></i>', // or bi-nintendo if you have custom icon
                'Google Play Store': '<i class="bi bi-google-play"></i>' // Not official in bootstrap, consider custom icon
            };
            return icons[storeName] || '<i class="bi bi-bag"></i>'; // default icon
        }