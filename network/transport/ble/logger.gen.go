// Code generated by berty.tech/core/.scripts/generate-logger.sh

package ble

import "go.uber.org/zap"

func logger() *zap.Logger {
	return zap.L().Named("network.transport.ble")
}
