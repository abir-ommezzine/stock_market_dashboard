package com.stockproject.experiment_service.util;

import java.util.*;
import java.util.stream.Collectors;

public class StockSymbols {
    
    public static class Stock {
        private final String symbol;
        private final String name;
        
        public Stock(String symbol, String name) {
            this.symbol = symbol;
            this.name = name;
        }
        
        public String getSymbol() { return symbol; }
        public String getName() { return name; }
    }
    
    private static final List<Stock> STOCKS = Arrays.asList(
        // Major Tech Stocks
        new Stock("AAPL", "Apple Inc."),
        new Stock("MSFT", "Microsoft Corporation"),
        new Stock("GOOGL", "Alphabet Inc. Class A"),
        new Stock("GOOG", "Alphabet Inc. Class C"),
        new Stock("AMZN", "Amazon.com Inc."),
        new Stock("META", "Meta Platforms Inc."),
        new Stock("TSLA", "Tesla Inc."),
        new Stock("NVDA", "NVIDIA Corporation"),
        new Stock("AMD", "Advanced Micro Devices Inc."),
        new Stock("INTC", "Intel Corporation"),
        new Stock("NFLX", "Netflix Inc."),
        new Stock("ADBE", "Adobe Inc."),
        new Stock("CRM", "Salesforce Inc."),
        new Stock("ORCL", "Oracle Corporation"),
        new Stock("CSCO", "Cisco Systems Inc."),
        new Stock("AVGO", "Broadcom Inc."),
        new Stock("QCOM", "QUALCOMM Incorporated"),
        new Stock("TXN", "Texas Instruments Incorporated"),
        new Stock("IBM", "International Business Machines"),
        new Stock("UBER", "Uber Technologies Inc."),
        new Stock("LYFT", "Lyft Inc."),
        new Stock("SNAP", "Snap Inc."),
        new Stock("TWTR", "Twitter Inc."),
        new Stock("SPOT", "Spotify Technology S.A."),
        new Stock("SQ", "Block Inc."),
        new Stock("PYPL", "PayPal Holdings Inc."),
        new Stock("SHOP", "Shopify Inc."),
        new Stock("ROKU", "Roku Inc."),
        new Stock("ZM", "Zoom Video Communications"),
        new Stock("DOCU", "DocuSign Inc."),
        new Stock("SNOW", "Snowflake Inc."),
        new Stock("PLTR", "Palantir Technologies Inc."),
        new Stock("COIN", "Coinbase Global Inc."),
        
        // Financial Services
        new Stock("JPM", "JPMorgan Chase & Co."),
        new Stock("BAC", "Bank of America Corporation"),
        new Stock("WFC", "Wells Fargo & Company"),
        new Stock("C", "Citigroup Inc."),
        new Stock("GS", "The Goldman Sachs Group"),
        new Stock("MS", "Morgan Stanley"),
        new Stock("BLK", "BlackRock Inc."),
        new Stock("SCHW", "The Charles Schwab Corporation"),
        new Stock("AXP", "American Express Company"),
        new Stock("V", "Visa Inc."),
        new Stock("MA", "Mastercard Incorporated"),
        new Stock("BRK.B", "Berkshire Hathaway Inc. Class B"),
        
        // Healthcare & Pharma
        new Stock("JNJ", "Johnson & Johnson"),
        new Stock("UNH", "UnitedHealth Group Incorporated"),
        new Stock("PFE", "Pfizer Inc."),
        new Stock("ABBV", "AbbVie Inc."),
        new Stock("TMO", "Thermo Fisher Scientific Inc."),
        new Stock("ABT", "Abbott Laboratories"),
        new Stock("MRK", "Merck & Co. Inc."),
        new Stock("LLY", "Eli Lilly and Company"),
        new Stock("AMGN", "Amgen Inc."),
        new Stock("GILD", "Gilead Sciences Inc."),
        new Stock("BMY", "Bristol-Myers Squibb Company"),
        new Stock("CVS", "CVS Health Corporation"),
        new Stock("CI", "The Cigna Group"),
        new Stock("MRNA", "Moderna Inc."),
        new Stock("BNTX", "BioNTech SE"),
        
        // Consumer & Retail
        new Stock("WMT", "Walmart Inc."),
        new Stock("HD", "The Home Depot Inc."),
        new Stock("COST", "Costco Wholesale Corporation"),
        new Stock("NKE", "NIKE Inc."),
        new Stock("MCD", "McDonald's Corporation"),
        new Stock("SBUX", "Starbucks Corporation"),
        new Stock("TGT", "Target Corporation"),
        new Stock("LOW", "Lowe's Companies Inc."),
        new Stock("TJX", "The TJX Companies Inc."),
        new Stock("DIS", "The Walt Disney Company"),
        new Stock("CMCSA", "Comcast Corporation"),
        new Stock("PEP", "PepsiCo Inc."),
        new Stock("KO", "The Coca-Cola Company"),
        new Stock("PG", "The Procter & Gamble Company"),
        new Stock("PM", "Philip Morris International"),
        new Stock("MO", "Altria Group Inc."),
        
        // Energy
        new Stock("XOM", "Exxon Mobil Corporation"),
        new Stock("CVX", "Chevron Corporation"),
        new Stock("COP", "ConocoPhillips"),
        new Stock("SLB", "Schlumberger Limited"),
        new Stock("EOG", "EOG Resources Inc."),
        new Stock("PSX", "Phillips 66"),
        new Stock("VLO", "Valero Energy Corporation"),
        new Stock("MPC", "Marathon Petroleum Corporation"),
        
        // Industrial & Manufacturing
        new Stock("BA", "The Boeing Company"),
        new Stock("CAT", "Caterpillar Inc."),
        new Stock("GE", "General Electric Company"),
        new Stock("MMM", "3M Company"),
        new Stock("HON", "Honeywell International Inc."),
        new Stock("UPS", "United Parcel Service Inc."),
        new Stock("FDX", "FedEx Corporation"),
        new Stock("LMT", "Lockheed Martin Corporation"),
        new Stock("RTX", "RTX Corporation"),
        new Stock("DE", "Deere & Company"),
        
        // Automotive
        new Stock("F", "Ford Motor Company"),
        new Stock("GM", "General Motors Company"),
        new Stock("RIVN", "Rivian Automotive Inc."),
        new Stock("LCID", "Lucid Group Inc."),
        new Stock("NIO", "NIO Inc."),
        new Stock("XPEV", "XPeng Inc."),
        
        // Telecommunications
        new Stock("T", "AT&T Inc."),
        new Stock("VZ", "Verizon Communications Inc."),
        new Stock("TMUS", "T-Mobile US Inc."),
        
        // Real Estate & Construction
        new Stock("AMT", "American Tower Corporation"),
        new Stock("PLD", "Prologis Inc."),
        new Stock("CCI", "Crown Castle Inc."),
        new Stock("EQIX", "Equinix Inc."),
        
        // Semiconductors
        new Stock("TSM", "Taiwan Semiconductor Manufacturing"),
        new Stock("ASML", "ASML Holding N.V."),
        new Stock("MU", "Micron Technology Inc."),
        new Stock("AMAT", "Applied Materials Inc."),
        new Stock("LRCX", "Lam Research Corporation"),
        new Stock("KLAC", "KLA Corporation"),
        new Stock("MRVL", "Marvell Technology Inc."),
        
        // E-commerce & Delivery
        new Stock("BABA", "Alibaba Group Holding Limited"),
        new Stock("JD", "JD.com Inc."),
        new Stock("PDD", "PDD Holdings Inc."),
        new Stock("MELI", "MercadoLibre Inc."),
        new Stock("EBAY", "eBay Inc."),
        new Stock("DASH", "DoorDash Inc."),
        
        // Entertainment & Media
        new Stock("WBD", "Warner Bros. Discovery Inc."),
        new Stock("PARA", "Paramount Global"),
        new Stock("SONY", "Sony Group Corporation"),
        new Stock("EA", "Electronic Arts Inc."),
        new Stock("TTWO", "Take-Two Interactive Software"),
        new Stock("ATVI", "Activision Blizzard Inc."),
        
        // Airlines & Travel
        new Stock("AAL", "American Airlines Group Inc."),
        new Stock("DAL", "Delta Air Lines Inc."),
        new Stock("UAL", "United Airlines Holdings Inc."),
        new Stock("LUV", "Southwest Airlines Co."),
        new Stock("ABNB", "Airbnb Inc."),
        new Stock("BKNG", "Booking Holdings Inc."),
        new Stock("EXPE", "Expedia Group Inc."),
        
        // Biotech
        new Stock("VRTX", "Vertex Pharmaceuticals Incorporated"),
        new Stock("REGN", "Regeneron Pharmaceuticals Inc."),
        new Stock("BIIB", "Biogen Inc."),
        new Stock("ILMN", "Illumina Inc."),
        new Stock("ALNY", "Alnylam Pharmaceuticals Inc.")
    );
    
    public static List<Stock> getAllStocks() {
        return new ArrayList<>(STOCKS);
    }
    
    public static List<Stock> searchStocks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllStocks();
        }
        
        String lowerQuery = query.toLowerCase().trim();
        
        return STOCKS.stream()
            .filter(stock -> 
                stock.getSymbol().toLowerCase().contains(lowerQuery) ||
                stock.getName().toLowerCase().contains(lowerQuery)
            )
            .limit(50) // Limit results to 50
            .collect(Collectors.toList());
    }
    
    public static List<String> getSymbolsOnly() {
        return STOCKS.stream()
            .map(Stock::getSymbol)
            .collect(Collectors.toList());
    }
}
