package cli

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"sent/internal/app"
)

var (
	mode    string
	service string
)

// Execute runs the root command.
func Execute() error {
	rootCmd := &cobra.Command{
		Use:   "sent",
		Short: "SENT - Unified Modular Monolith",
		Long:  `SENT is a modular monolith platform designed for enterprise resource planning, integrating finance, inventory, auth, and more.`,
		Run:   runApp,
	}

	validateCmd := &cobra.Command{
		Use:   "validate",
		Short: "Run Gold Master validation suite",
		Run:   runValidation,
	}

	seedCmd := &cobra.Command{
		Use:   "seed",
		Short: "Seed database with comprehensive fake data",
		Run:   runSeeding,
	}

	rootCmd.AddCommand(validateCmd)
	rootCmd.AddCommand(seedCmd)
	rootCmd.PersistentFlags().StringVar(&mode, "mode", "client", "Application mode: 'client' (GUI) or 'worker' (Headless)")
	rootCmd.PersistentFlags().StringVar(&service, "service", "", "Specific service to run in worker mode")

	return rootCmd.Execute()
}

func runApp(cmd *cobra.Command, args []string) {
	app.Run(mode, service)
}

func runValidation(cmd *cobra.Command, args []string) {
	app.RunValidation()
}

func runSeeding(cmd *cobra.Command, args []string) {
	if err := app.RunSeeding(); err != nil {
		fmt.Printf("Seeding failed: %v\n", err)
		os.Exit(1)
	}
}
