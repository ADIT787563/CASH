import { NextRequest, NextResponse } from 'next/server';

interface ParsedProduct {
    name: string;
    price: number;
    category: string;
    description: string;
    imageUrl?: string;
    stock?: number;
}

interface ProcessingResult {
    success: boolean;
    product?: ParsedProduct;
    error?: string;
}

// Parse CSV content
function parseCSV(content: string): ParsedProduct[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products: ParsedProduct[] = [];

    // Validate required columns
    const requiredColumns = ['name', 'price', 'category'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        const product: any = {};

        headers.forEach((header, index) => {
            const value = values[index] || '';

            switch (header) {
                case 'name':
                    product.name = value;
                    break;
                case 'price':
                    product.price = parseFloat(value) || 0;
                    break;
                case 'category':
                    product.category = value;
                    break;
                case 'description':
                    product.description = value || `${product.name} - Premium quality product`;
                    break;
                case 'stock':
                    product.stock = parseInt(value) || 100;
                    break;
                case 'imageurl':
                case 'image':
                    product.imageUrl = value;
                    break;
            }
        });

        // Set defaults
        if (!product.description) {
            product.description = `${product.name} - Premium quality product`;
        }
        if (product.stock === undefined) {
            product.stock = 100;
        }

        products.push(product as ParsedProduct);
    }

    return products;
}

// Analyze image with AI (simulated for now - you can integrate OpenAI Vision API)
async function analyzeImage(imageData: ArrayBuffer, fileName: string): Promise<ParsedProduct> {
    // For now, we'll simulate AI analysis
    // In production, you would call OpenAI Vision API or similar service here

    // Convert ArrayBuffer to base64 for storage
    const base64Image = Buffer.from(imageData).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    // Simulate AI-generated product details based on filename
    const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    // Simple categorization logic
    let category = 'Other';
    const lowerName = baseName.toLowerCase();

    if (lowerName.includes('shirt') || lowerName.includes('tshirt') || lowerName.includes('cloth')) {
        category = 'Clothing';
    } else if (lowerName.includes('shoe') || lowerName.includes('sneaker')) {
        category = 'Footwear';
    } else if (lowerName.includes('phone') || lowerName.includes('laptop') || lowerName.includes('electronic')) {
        category = 'Electronics';
    } else if (lowerName.includes('book')) {
        category = 'Books & Stationery';
    } else if (lowerName.includes('toy')) {
        category = 'Toys & Games';
    }

    // Generate price based on category (simulated)
    const priceRanges: Record<string, [number, number]> = {
        'Clothing': [500, 2000],
        'Footwear': [1000, 5000],
        'Electronics': [5000, 50000],
        'Books & Stationery': [200, 1000],
        'Toys & Games': [300, 3000],
        'Other': [500, 2000],
    };

    const [min, max] = priceRanges[category] || [500, 2000];
    const price = Math.floor(Math.random() * (max - min) + min);

    return {
        name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
        price,
        category,
        description: `Premium ${baseName} with excellent quality and modern design. Perfect for everyday use.`,
        imageUrl,
        stock: Math.floor(Math.random() * 50) + 50, // Random stock between 50-100
    };
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const mode = formData.get('mode') as string;

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        const results: ProcessingResult[] = [];

        if (mode === 'csv') {
            // Process CSV files
            for (const file of files) {
                try {
                    const content = await file.text();
                    const products = parseCSV(content);

                    products.forEach(product => {
                        results.push({
                            success: true,
                            product,
                        });
                    });
                } catch (error) {
                    results.push({
                        success: false,
                        error: error instanceof Error ? error.message : 'Failed to parse CSV',
                    });
                }
            }
        } else if (mode === 'images') {
            // Process image files
            for (const file of files) {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const product = await analyzeImage(arrayBuffer, file.name);

                    results.push({
                        success: true,
                        product,
                    });
                } catch (error) {
                    results.push({
                        success: false,
                        error: error instanceof Error ? error.message : 'Failed to analyze image',
                    });
                }
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid mode' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            results,
        });

    } catch (error) {
        console.error('AI Catalog Builder error:', error);
        return NextResponse.json(
            { error: 'Failed to process files' },
            { status: 500 }
        );
    }
}
