package stock

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "modernc.org/sqlite"
)

type LocalPOSBuffer struct {
	db *sql.DB
}

func NewLocalPOSBuffer(dbPath string) (*LocalPOSBuffer, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite pos buffer: %w", err)
	}

	// Create table for buffered sales
	query := `
	CREATE TABLE IF NOT EXISTS buffered_sales (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		data TEXT NOT NULL
	);`
	if _, err := db.Exec(query); err != nil {
		return nil, fmt.Errorf("failed to create pos buffer table: %w", err)
	}

	return &LocalPOSBuffer{db: db}, nil
}

func (b *LocalPOSBuffer) BufferSale(req SaleRequest) error {
	data, err := json.Marshal(req)
	if err != nil {
		return err
	}

	_, err = b.db.Exec("INSERT INTO buffered_sales (data) VALUES (?)", string(data))
	return err
}

func (b *LocalPOSBuffer) GetPending(limit int) ([]SaleRequest, []int64, error) {
	rows, err := b.db.Query("SELECT id, data FROM buffered_sales ORDER BY id ASC LIMIT ?", limit)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var sales []SaleRequest
	var ids []int64
	for rows.Next() {
		var id int64
		var dataStr string
		if err := rows.Scan(&id, &dataStr); err != nil {
			continue
		}
		var s SaleRequest
		if err := json.Unmarshal([]byte(dataStr), &s); err != nil {
			continue
		}
		sales = append(sales, s)
		ids = append(ids, id)
	}
	return sales, ids, nil
}

func (b *LocalPOSBuffer) DeleteBuffered(ids []int64) error {
	if len(ids) == 0 {
		return nil
	}
	for _, id := range ids {
		_, err := b.db.Exec("DELETE FROM buffered_sales WHERE id = ?", id)
		if err != nil {
			return err
		}
	}
	return nil
}

func (b *LocalPOSBuffer) Close() error {
	return b.db.Close()
}
