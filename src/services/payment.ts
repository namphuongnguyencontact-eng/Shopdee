export interface PaymentProcessRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  userId: string;
  paymentMethod: "WALLET" | "SIMULATED_CARD" | "SIMULATED_COD" | "COD" | "CARD";
}

export interface PaymentProcessResult {
  success: boolean;
  transactionId: string;
  isSimulation: boolean;
  message: string;
  timestamp: string;
}

export interface IPaymentService {
  processPayment(request: PaymentProcessRequest): Promise<PaymentProcessResult>;
}

export class SimulationPaymentService implements IPaymentService {
  async processPayment(request: PaymentProcessRequest): Promise<PaymentProcessResult> {
    // Simulate real-world network delay (e.g. 500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const simulatedTxId = "SIM_TX_" + Math.random().toString(36).substring(2, 10).toUpperCase();

    return {
      success: true,
      transactionId: simulatedTxId,
      isSimulation: true,
      message: "Thanh toán thành công. Giao dịch được bảo vệ an toàn bởi SHOPDEE.",
      timestamp: new Date().toISOString(),
    };
  }
}

// Singleton instance ready to be replaced with RealPaymentService in production
export const paymentService: IPaymentService = new SimulationPaymentService();
