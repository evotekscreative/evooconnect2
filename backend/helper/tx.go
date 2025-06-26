package helper

import (
	"database/sql"
	"fmt"
)

func CommitOrRollback(tx *sql.Tx) {
	err := recover()
	if err != nil {
		// Log error sebelum rollback
		fmt.Printf("Transaction error, rolling back: %v\n", err)

		errorRollback := tx.Rollback()
		if errorRollback != nil {
			fmt.Printf("Rollback error: %v\n", errorRollback)
		}
		panic(err)
	} else {
		errorCommit := tx.Commit()
		if errorCommit != nil {
			fmt.Printf("Commit error: %v\n", errorCommit)
			PanicIfError(errorCommit)
		}
	}
}
