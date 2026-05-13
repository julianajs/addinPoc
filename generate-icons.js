#!/usr/bin/env node

/**
 * Script para gerar ícones PNG a partir de SVG
 * Requisita: npm install sharp svgson
 * 
 * Se não tiver as dependências, crie os ícones manualmente
 * ou use uma ferramenta online como https://convertio.co/
 */

const fs = require('fs');
const path = require('path');

// Verificar se sharp está instalado
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.warn('⚠️  sharp não está instalado. Use: npm install sharp');
    console.log('Criando ícones padrão (SVG) em vez de PNG...\n');
    generateSVGIcons();
    process.exit(0);
}

const iconsDir = path.join(__dirname, 'icons');

// Criar diretório de ícones se não existir
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG Bandeira Vermelha
const redFlagSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 20 80 L 20 10 L 60 10 Q 70 10 70 20 Q 70 30 60 30 L 20 30 L 20 80" fill="#DC3545" stroke="#333" stroke-width="2"/>
</svg>`;

// SVG Bandeira Verde com Checkmark
const greenFlagSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 20 80 L 20 10 L 60 10 Q 70 10 70 20 Q 70 30 60 30 L 20 30 L 20 80" fill="#28A745" stroke="#333" stroke-width="2"/>
  <polyline points="35,35 45,45 60,25" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

async function generateIconsFromSVG() {
    const sizes = [16, 25, 32, 80];
    
    console.log('🎨 Gerando ícones PNG...\n');

    // Gerar ícones vermelhos
    for (const size of sizes) {
        const filename = `red-flag-${size}.png`;
        try {
            await sharp(Buffer.from(redFlagSVG))
                .resize(size, size)
                .png()
                .toFile(path.join(iconsDir, filename));
            console.log(`✅ ${filename} criado`);
        } catch (error) {
            console.error(`❌ Erro ao criar ${filename}:`, error.message);
        }
    }

    console.log('');

    // Gerar ícones verdes
    for (const size of sizes) {
        const filename = `green-flag-${size}.png`;
        try {
            await sharp(Buffer.from(greenFlagSVG))
                .resize(size, size)
                .png()
                .toFile(path.join(iconsDir, filename));
            console.log(`✅ ${filename} criado`);
        } catch (error) {
            console.error(`❌ Erro ao criar ${filename}:`, error.message);
        }
    }

    console.log('\n✨ Ícones gerados com sucesso em ./icons/');
}

function generateSVGIcons() {
    const sizes = [16, 25, 32, 80];
    
    console.log('📝 Criando arquivos SVG...\n');

    // Gerar SVGs vermelhos
    for (const size of sizes) {
        const filename = `red-flag-${size}.svg`;
        fs.writeFileSync(
            path.join(iconsDir, filename),
            redFlagSVG
        );
        console.log(`✅ ${filename} criado`);
    }

    console.log('');

    // Gerar SVGs verdes
    for (const size of sizes) {
        const filename = `green-flag-${size}.svg`;
        fs.writeFileSync(
            path.join(iconsDir, filename),
            greenFlagSVG
        );
        console.log(`✅ ${filename} criado`);
    }

    console.log('\n📝 Ícones SVG criados. Para gerar PNG, instale sharp:');
    console.log('   npm install sharp');
    console.log('   node generate-icons.js\n');
}

// Executar geração
if (sharp) {
    generateIconsFromSVG().catch(error => {
        console.error('Erro:', error);
        process.exit(1);
    });
} else {
    generateSVGIcons();
}
