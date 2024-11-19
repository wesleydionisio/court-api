const getActivePaymentMethods = async (req, res) => {
    try {
        // Lógica para buscar métodos de pagamento ativos
        res.json({ /* dados */ });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCourtPaymentMethods = async (req, res) => {
    try {
        const { courtId } = req.params;
        // Lógica para buscar métodos de pagamento da quadra
        res.json({ /* dados */ });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getActivePaymentMethods,
    getCourtPaymentMethods
};