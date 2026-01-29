package stock

// ReservationReleaseArgs handles the automatic release of an inventory reservation.
type ReservationReleaseArgs struct {
	ReservationID int `json:"reservation_id"`
}

func (ReservationReleaseArgs) Kind() string { return "stock.reservation_release" }
