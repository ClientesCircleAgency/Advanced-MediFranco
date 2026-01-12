
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";

export interface Notification {
    id: string;
    type: "request" | "appointment";
    title: string;
    description: string;
    time: string;
    link: string;
    read: boolean;
}

export function useNotifications() {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: async (): Promise<Notification[]> => {
            const today = new Date();
            const tomorrow = addDays(today, 1);
            const todayStr = format(today, "yyyy-MM-dd");
            const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

            // 1. Fetch pending appointment requests
            const { data: requests, error: requestsError } = await supabase
                .from("appointment_requests")
                .select("*")
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (requestsError) {
                console.error("Error fetching requests:", requestsError);
            }

            // 2. Fetch upcoming appointments (today and tomorrow)
            const { data: appointments, error: appointmentsError } = await supabase
                .from("appointments")
                .select("*, patient:patients(name), specialty:specialties(name)")
                .in("status", ["scheduled", "confirmed"])
                .gte("date", todayStr)
                .lte("date", tomorrowStr)
                .order("date", { ascending: true })
                .order("time", { ascending: true });

            if (appointmentsError) {
                console.error("Error fetching appointments:", appointmentsError);
            }

            const notifications: Notification[] = [];

            // Process requests
            requests?.forEach((req) => {
                notifications.push({
                    id: `req-${req.id}`,
                    type: "request",
                    title: `Nova Solicitação: ${req.name}`,
                    description: `Pedido para ${format(new Date(req.preferred_date), "dd/MM")} (${req.service_type})`,
                    time: req.created_at,
                    link: "/admin/pedidos",
                    read: false,
                });
            });

            // Process appointments
            appointments?.forEach((app: any) => {
                const isToday = app.date === todayStr;
                notifications.push({
                    id: `app-${app.id}`,
                    type: "appointment",
                    title: `${isToday ? "Hoje" : "Amanhã"}: ${app.patient?.name || "Paciente"}`,
                    description: `${app.specialty?.name || "Consulta"} às ${app.time.slice(0, 5)}`,
                    time: app.created_at, // Using created_at for sorting not ideal, but date/time is better for display
                    link: "/admin/agenda",
                    read: false,
                });
            });

            // Sort by roughly "relevance" (newest requests first? or nearest appointments?)
            // Let's sort requests by created_at desc, and appointments are already sorted by date/time.
            // Merging: simple concat for now, maybe appointments first if urgency?
            // Let's just put all together.

            return notifications;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}
